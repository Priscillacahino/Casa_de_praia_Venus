import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, chmodSync, existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { randomBytes, createCipheriv } from "node:crypto";
if(process.loadEnvFile){try{process.loadEnvFile()}catch{}}
const source=process.env.DATABASE_PATH||"./data/venus.sqlite";if(!existsSync(source))throw new Error("Banco não encontrado.");
mkdirSync("backups",{recursive:true,mode:0o700});const stamp=new Date().toISOString().replaceAll(":","-");const plain=`backups/venus-${stamp}.sqlite`;const db=new DatabaseSync(source,{readOnly:true});await backup(db,plain);db.close();chmodSync(plain,0o600);
const keyB64=process.env.BACKUP_ENCRYPTION_KEY||"";if(!keyB64){if(process.env.NODE_ENV==="production"){unlinkSync(plain);throw new Error("BACKUP_ENCRYPTION_KEY é obrigatória em produção.")}console.warn("Backup local criado sem criptografia porque BACKUP_ENCRYPTION_KEY não foi configurada.");console.log(plain);process.exit(0)}
const key=Buffer.from(keyB64,"base64");if(key.length!==32){unlinkSync(plain);throw new Error("BACKUP_ENCRYPTION_KEY deve ter 32 bytes em Base64.")}
const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv),input=readFileSync(plain),encrypted=Buffer.concat([cipher.update(input),cipher.final()]),tag=cipher.getAuthTag();const output=plain+".enc";writeFileSync(output,Buffer.concat([Buffer.from("VENUSBAK1"),iv,tag,encrypted]),{mode:0o600});unlinkSync(plain);console.log(`Backup criptografado criado: ${output}`);
