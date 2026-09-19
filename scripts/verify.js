import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const required = [
  "server/app.js","server/db.js","server/domain.js","server/compliance.js","server/index.js",
  "server/runtime-config.js","docs/termo-compromisso-minuta.txt","public/index.html",
  "public/admin.html","scripts/production-check.js","scripts/restore-backup.js",
];
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Arquivo obrigatório ausente: ${file}`);
    process.exit(1);
  }
}

for (const file of [
  "server/app.js","server/db.js","server/domain.js","server/compliance.js","server/index.js",
  "server/runtime-config.js","public/app.js","public/admin.js","public/sw.js",
  "scripts/production-check.js","scripts/restore-backup.js",
]) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio:"inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

const pkg = JSON.parse(readFileSync("package.json","utf8"));
if (Object.keys(pkg.dependencies || {}).length || Object.keys(pkg.devDependencies || {}).length) {
  console.error("Backend endurecido deve permanecer sem dependências NPM externas.");
  process.exit(1);
}
if (pkg.scripts?.["production:check"] !== "node scripts/production-check.js") {
  console.error("Script production:check ausente ou inesperado.");
  process.exit(1);
}
console.log("Verificação estrutural concluída.");
