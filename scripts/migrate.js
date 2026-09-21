import { openDatabase } from "../server/db.js";
if (process.loadEnvFile) { try { process.loadEnvFile(); } catch {} }
const path = process.env.DATABASE_PATH || "./data/venus.sqlite";
const db = openDatabase(path);
try {
  const version = Number(db.prepare("PRAGMA user_version").get()?.user_version || 0);
  console.log(`Migração concluída. Schema atual: ${version}.`);
} finally { db.close(); }
