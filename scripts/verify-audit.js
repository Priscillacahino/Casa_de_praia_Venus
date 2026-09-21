import { createHash, createHmac } from "node:crypto";
import { openDatabase } from "../server/db.js";
if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }
const hash = (value) => createHash("sha256").update(value).digest("hex");
const secret = process.env.AUDIT_HMAC_SECRET || "";
const db = openDatabase(process.env.DATABASE_PATH || "./data/venus.sqlite");
const rows = db.prepare("SELECT * FROM audit ORDER BY id").all();
let previous = "";
for (const row of rows) {
  if (!row.entry_hash) continue;
  const version = Number(row.chain_version || 1);
  if (version >= 2 && secret.length < 32) {
    console.error("AUDIT_HMAC_SECRET é necessária para verificar eventos de auditoria v2.");
    db.close(); process.exit(1);
  }
  const payload = version >= 2
    ? JSON.stringify({ action:row.action, resource:row.resource, actor:row.actor, requestId:row.request_id, details:row.details_json, previous, createdAt:row.created_at })
    : JSON.stringify({ action:row.action, resource:row.resource, actor:row.actor, requestId:row.request_id, details:row.details_json, previous });
  const expected = version >= 2
    ? createHmac("sha256", secret).update(payload).digest("hex")
    : hash(payload);
  if ((row.previous_hash || "") !== previous || row.entry_hash !== expected) {
    console.error(`Falha de integridade no evento de auditoria ${row.id}.`);
    db.close(); process.exit(1);
  }
  previous = row.entry_hash || "";
}
console.log(`Trilha íntegra: ${rows.length} evento(s) verificado(s).`);
db.close();
