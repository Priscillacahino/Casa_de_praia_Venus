import test from "node:test";
import assert from "node:assert/strict";
import { assertProductionConfig, productionConfigErrors } from "../server/runtime-config.js";

function validEnv() {
  return {
    NODE_ENV:"production",
    APP_URL:"https://venus.example",
    DATABASE_PATH:"/persistent/venus.sqlite",
    ADMIN_PASSWORD_HASH:"0123456789abcdef0123456789abcdef:" + "ab".repeat(64),
    ADMIN_TOTP_SECRET:"JBSWY3DPEHPK3PXP",
    RESERVATION_TOKEN_SECRET:"reservation-secret-0123456789abcdef",
    BACKUP_ENCRYPTION_KEY:Buffer.alloc(32, 7).toString("base64"),
    GUIDE_SOURCE_URL:"https://raw.githubusercontent.com/Priscillacahino/guia_lugares_pb/main/guia_offline.html",
    GUIDE_EXPECTED_SHA256:"a".repeat(64),
  };
}

test("configuração válida de produção passa no preflight central", () => {
  assert.equal(assertProductionConfig(validEnv()), true);
  assert.deepEqual(productionConfigErrors({ NODE_ENV:"development" }), []);
});

test("produção rejeita configuração frágil", () => {
  const env = validEnv();
  env.APP_URL = "http://venus.example";
  env.DATABASE_PATH = ":memory:";
  env.BACKUP_ENCRYPTION_KEY = "fraca";
  env.GUIDE_EXPECTED_SHA256 = "";
  const errors = productionConfigErrors(env);
  assert.ok(errors.some((e) => e.includes("HTTPS")));
  assert.ok(errors.some((e) => e.includes("armazenamento persistente")));
  assert.ok(errors.some((e) => e.includes("32 bytes")));
  assert.ok(errors.some((e) => e.includes("GUIDE_EXPECTED_SHA256")));
  assert.throws(() => assertProductionConfig(env), /Configuração de produção inválida/);
});
