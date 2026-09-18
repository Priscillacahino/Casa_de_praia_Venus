import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { openDatabase } from "../server/db.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const backupScript = join(projectRoot, "scripts", "backup.js");
const restoreScript = join(projectRoot, "scripts", "restore-backup.js");
const work = mkdtempSync(join(tmpdir(), "venus-backup-selftest-"));

function run(script, args, env) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: work,
    env,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`${script} falhou.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  }
}

try {
  const dbPath = join(work, "data", "venus.sqlite");
  const db = openDatabase(dbPath);
  db.prepare("INSERT INTO messages(id,name,email,phone,dates,message) VALUES(?,?,?,?,?,?)")
    .run("selftest", "Backup Self-test", "selftest@example.com", "", "", "Registro para validar backup");
  db.close();

  const key = randomBytes(32).toString("base64");
  const env = {
    ...process.env,
    NODE_ENV: "production",
    DATABASE_PATH: dbPath,
    BACKUP_ENCRYPTION_KEY: key,
  };

  run(backupScript, [], env);
  const backupDir = join(work, "backups");
  const encrypted = readdirSync(backupDir).find((name) => name.endsWith(".sqlite.enc"));
  assert.ok(encrypted, "Backup criptografado não foi criado.");

  const restoredPath = join(work, "restored", "venus.sqlite");
  run(restoreScript, [join(backupDir, encrypted), restoredPath], env);

  const restored = new DatabaseSync(restoredPath, { readOnly: true });
  assert.equal(restored.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  assert.equal(restored.prepare("SELECT COUNT(*) AS total FROM messages WHERE id='selftest'").get().total, 1);
  restored.close();

  console.log("Backup self-test: APROVADO");
} finally {
  rmSync(work, { recursive: true, force: true });
}
