import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
const required=["server/app.js","server/db.js","server/domain.js","server/compliance.js","server/index.js","docs/termo-compromisso-minuta.txt","public/index.html","public/admin.html"];
for(const file of required) if(!existsSync(file)){console.error(`Arquivo obrigatório ausente: ${file}`);process.exit(1)}
for(const file of ["server/app.js","server/db.js","server/domain.js","server/compliance.js","server/index.js","public/app.js","public/admin.js","public/sw.js"]){const r=spawnSync(process.execPath,["--check",file],{stdio:"inherit"});if(r.status!==0)process.exit(r.status||1)}
const pkg=JSON.parse(readFileSync("package.json","utf8"));if(Object.keys(pkg.dependencies||{}).length||Object.keys(pkg.devDependencies||{}).length){console.error("Backend endurecido deve permanecer sem dependências NPM externas.");process.exit(1)}
console.log("Verificação estrutural concluída.");
