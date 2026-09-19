import { openDatabase } from "./db.js";
import { createApp } from "./app.js";
import { assertProductionConfig } from "./runtime-config.js";

if (process.loadEnvFile) {
  try { process.loadEnvFile(); } catch {}
}
const production = process.env.NODE_ENV === "production";
if (production) assertProductionConfig(process.env);
const databasePath = process.env.DATABASE_PATH || "./data/venus.sqlite";
const db = openDatabase(databasePath);
const app = createApp(db, {
  staticDir: "public",
  production,
});
const server = app.listen(Number(process.env.PORT || 3001), "0.0.0.0", () => {
  console.log("Vênus API iniciada.");
});
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
}
