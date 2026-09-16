import "dotenv/config";
import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, chmodSync, existsSync } from "node:fs";
const source = process.env.DATABASE_PATH || "./data/venus.sqlite";
if (!existsSync(source)) throw new Error("Banco não encontrado.");
mkdirSync("backups", { recursive: true, mode: 0o700 });
const destination =
  "backups/venus-" + new Date().toISOString().replaceAll(":", "-") + ".sqlite";
const db = new DatabaseSync(source, { readOnly: true });
await backup(db, destination);
db.close();
chmodSync(destination, 0o600);
console.log("Backup criado: " + destination);
