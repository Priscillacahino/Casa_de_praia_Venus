import {
  assertProductionConfig,
} from "../server/runtime-config.js";

if (process.loadEnvFile) {
  try { process.loadEnvFile(); } catch {}
}

const env = {
  ...process.env,
  NODE_ENV:"production",
};

assertProductionConfig(env);

console.log(JSON.stringify({
  productionConfig:"ok",
}));

console.log(
  "CONFIGURACAO DE PRODUCAO: APROVADA",
);