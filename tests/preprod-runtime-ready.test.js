import test from "node:test";
import assert from "node:assert/strict";

import { openDatabase } from "../server/db.js";
import { createApp } from "../server/app.js";

test("health e readiness acompanham o schema 10", async (t) => {
  const db = openDatabase(":memory:");

  const app = createApp(db, {
    production:false,
  });

  const server = app.listen(
    0,
    "127.0.0.1",
  );

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  t.after(async () => {
    await new Promise((resolve) => {
      server.close(() => {
        db.close();
        resolve();
      });
    });
  });

  const base =
    `http://127.0.0.1:${server.address().port}`;

  const healthResponse = await fetch(
    `${base}/api/health`,
  );

  assert.equal(
    healthResponse.status,
    200,
  );

  const health =
    await healthResponse.json();

  assert.equal(
    health.ok,
    true,
  );

  assert.equal(
    health.version,
    10,
  );

  const readyResponse = await fetch(
    `${base}/api/ready`,
  );

  assert.equal(
    readyResponse.status,
    200,
  );

  const ready =
    await readyResponse.json();

  assert.deepEqual(
    ready,
    {
      ok:true,
      schemaVersion:10,
    },
  );
});