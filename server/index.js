import "dotenv/config";
import { openDatabase } from "./db.js";
import { createApp } from "./app.js";
const db = openDatabase(process.env.DATABASE_PATH || "./data/venus.sqlite");
const app = createApp(db, {
  staticDir: process.env.NODE_ENV === "production" ? "dist" : undefined,
});
const server = app.listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
  console.log("Vênus API iniciada."),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
