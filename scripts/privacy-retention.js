import { openDatabase } from "../server/db.js";
if(process.loadEnvFile){try{process.loadEnvFile()}catch{}}
const days=Number(process.env.RETENTION_DAYS||365);if(!Number.isInteger(days)||days<30||days>3650)throw new Error("RETENTION_DAYS deve ficar entre 30 e 3650.");const db=openDatabase(process.env.DATABASE_PATH||"./data/venus.sqlite");const cutoff=`-${days} days`;
const messages=db.prepare("DELETE FROM messages WHERE datetime(created_at) < datetime('now', ?)").run(cutoff).changes;
const reviews=db.prepare("DELETE FROM reviews WHERE approved=0 AND datetime(created_at) < datetime('now', ?)").run(cutoff).changes;
const candidates=db.prepare(`SELECT id FROM reservations r WHERE status IN ('requested','cancelled') AND datetime(created_at) < datetime('now', ?) AND NOT EXISTS(SELECT 1 FROM payments p WHERE p.reservation_id=r.id)`).all(cutoff);
let reservations=0;for(const r of candidates){reservations+=db.prepare("UPDATE reservations SET name='Anonimizado',email=?,phone='',notes='' WHERE id=?").run(`deleted+${r.id}@invalid.local`,r.id).changes}
console.log(JSON.stringify({retentionDays:days,messagesDeleted:messages,unapprovedReviewsDeleted:reviews,reservationsAnonymized:reservations}));db.close();
