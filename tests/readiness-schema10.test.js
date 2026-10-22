import test from "node:test";
import assert from "node:assert/strict";
import { openDatabase } from "../server/db.js";
import { createApp } from "../server/app.js";

test("health/ready refletem o schema 10 e detectam banco incompatível", async () => {
  const db = openDatabase(":memory:");
  const app = createApp(db);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const healthResponse = await fetch(`${base}/api/health`);
    const health = await healthResponse.json();
    assert.equal(healthResponse.status, 200);
    assert.equal(health.ok, true);
    assert.equal(health.version, 10);
    assert.equal(health.schemaVersion, 10);

    const readyResponse = await fetch(`${base}/api/ready`);
    const ready = await readyResponse.json();
    assert.equal(readyResponse.status, 200);
    assert.equal(ready.ok, true);
    assert.equal(ready.schemaVersion, 10);

    db.exec("PRAGMA user_version=9");
    const incompatibleResponse = await fetch(`${base}/api/ready`);
    const incompatible = await incompatibleResponse.json();
    assert.equal(incompatibleResponse.status, 503);
    assert.equal(incompatible.ok, false);
    assert.equal(incompatible.schemaVersion, 9);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }
});