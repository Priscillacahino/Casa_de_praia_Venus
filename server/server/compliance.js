import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { AppError, text, transaction } from "./domain.js";

export const TERM_VERSION = "2026-09-16-v1";
export const TERM_TEXT = readFileSync(new URL("../docs/termo-compromisso-minuta.txt", import.meta.url), "utf8");
export const TERM_HASH = createHash("sha256").update(TERM_TEXT).digest("hex");

export const legal = (db) => db.prepare("SELECT * FROM legal_approval WHERE id=1").get();
export const banking = (db) => JSON.parse(db.prepare("SELECT value FROM banking WHERE id=1").get().value);

export function readiness(db, row) {
  const approval = legal(db);
  const doc = db.prepare(
    "SELECT id,sha256,term_hash,validated_at FROM signed_terms WHERE reservation_id=?",
  ).get(row.id);
  const paid = db.prepare(
    "SELECT COALESCE(SUM(amount_cents),0) AS total FROM payments WHERE reservation_id=? AND settled=1",
  ).get(row.id).total;
  const q = JSON.parse(row.quote || "{}");
  const required = Math.round((q.totalCents || 0) * 0.2);
  const legalReady = approval?.approved === 1 && approval.term_hash === TERM_HASH;
  const signatureReady = !!doc?.validated_at && doc.term_hash === TERM_HASH;
  return {
    legalReady,
    signatureReady,
    paidCents: paid,
    requiredDepositCents: required,
    documentId: doc?.id || null,
    documentHash: doc?.sha256 || null,
    ready: legalReady && signatureReady && required > 0 && paid >= required,
  };
}

export function assertConfirmationReady(db, row) {
  const r = readiness(db, row);
  if (!r.legalReady) throw new AppError("O termo ainda depende de aprovação jurídica desta versão.", 422);
  if (!r.signatureReady) throw new AppError("Anexe o termo assinado e registre a validação antes de confirmar.", 422);
  if (r.requiredDepositCents <= 0 || r.paidCents < r.requiredDepositCents) {
    throw new AppError("O sinal de 20% ainda não foi confirmado como recebido.", 422);
  }
}

export function saveSignedTerm(db, reservationId, base64, audit) {
  const r = db.prepare("SELECT * FROM reservations WHERE id=?").get(reservationId);
  if (!r || r.status !== "requested") throw new AppError("Anexe documentos somente a pedidos pendentes.");
  if (typeof base64 !== "string" || base64.length > 7500000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new AppError("Arquivo PDF inválido ou maior que 5 MB.");
  }
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > 5 * 1024 * 1024 || bytes.subarray(0, 5).toString() !== "%PDF-") {
    throw new AppError("Envie o arquivo PDF original assinado, até 5 MB.");
  }
  const sha = createHash("sha256").update(bytes).digest("hex");
  const id = randomUUID();
  db.prepare(`INSERT INTO signed_terms(id,reservation_id,pdf,sha256,term_hash)
    VALUES(?,?,?,?,?)
    ON CONFLICT(reservation_id) DO UPDATE SET
      id=excluded.id,pdf=excluded.pdf,sha256=excluded.sha256,term_hash=excluded.term_hash,
      validated_at=NULL,reviewer=NULL,validation_reference=NULL,uploaded_at=CURRENT_TIMESTAMP`).run(
    id, r.id, bytes, sha, TERM_HASH,
  );
  audit("signature.uploaded", r.id, { sha256: sha });
  return { id, sha256: sha, status: "awaiting_validation" };
}

export function validateSignedTerm(db, reservationId, body, audit) {
  transaction(db, () => {
    const r = db.prepare("SELECT * FROM reservations WHERE id=?").get(reservationId);
    if (!r || r.status !== "requested") throw new AppError("Pedido não está pendente.");
    const d = db.prepare("SELECT * FROM signed_terms WHERE reservation_id=?").get(r.id);
    if (!d || d.sha256 !== body.sha256) throw new AppError("Documento mudou ou não foi enviado. Atualize a página.", 409);
    const l = legal(db);
    if (l?.approved !== 1 || l.term_hash !== TERM_HASH || d.term_hash !== TERM_HASH) {
      throw new AppError("Aprovação jurídica pendente ou versão desatualizada.", 422);
    }
    if (body.signatureChecked !== true || body.identityChecked !== true || body.contentChecked !== true) {
      throw new AppError("Confira assinatura, identidade e conteúdo.");
    }
    db.prepare(`UPDATE signed_terms SET validated_at=CURRENT_TIMESTAMP,reviewer=?,validation_reference=?
      WHERE reservation_id=?`).run(
      text(body.reviewer, "Responsável pela conferência", 3, 150),
      text(body.reference, "Relatório de validação ou protocolo", 5, 1500),
      r.id,
    );
    audit("signature.validated_manually", r.id, { sha256: d.sha256 });
  });
}
