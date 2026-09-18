import { randomBytes } from "node:crypto";
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32(buffer){let bits="";for(const b of buffer)bits+=b.toString(2).padStart(8,"0");let out="";for(let i=0;i<bits.length;i+=5){const chunk=bits.slice(i,i+5).padEnd(5,"0");out+=alphabet[parseInt(chunk,2)]}return out}
const secret=base32(randomBytes(20));
console.log(`ADMIN_TOTP_SECRET=${secret}`);
console.log(`URI para cadastrar manualmente no autenticador: otpauth://totp/Venus%20Beach%20House:admin?secret=${secret}&issuer=Venus%20Beach%20House&digits=6&period=30`);
console.log("Guarde o segredo apenas no gerenciador de segredos do ambiente. Não versione este valor.");
