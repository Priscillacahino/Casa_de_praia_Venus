import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
export function openDatabase(path) {
  if (path !== ":memory:")
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rates (id TEXT PRIMARY KEY, label TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, weekday_cents INTEGER NOT NULL CHECK(weekday_cents>0), weekend_cents INTEGER NOT NULL CHECK(weekend_cents>0), min_nights INTEGER NOT NULL CHECK(min_nights>0), CHECK(start_date < end_date));
    CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, request_key TEXT UNIQUE, request_hash TEXT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, guests INTEGER NOT NULL, has_pet INTEGER NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '', status TEXT NOT NULL CHECK(status IN ('requested','confirmed','cancelled','blocked')), quote TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, CHECK(check_in < check_out));
    CREATE INDEX IF NOT EXISTS reservations_dates ON reservations(check_in,check_out,status);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, dates TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, name TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, reservation_id TEXT NOT NULL REFERENCES reservations(id), amount_cents INTEGER NOT NULL CHECK(amount_cents != 0), note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, action TEXT NOT NULL, resource TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS legal_approval(id INTEGER PRIMARY KEY CHECK(id=1),approved INTEGER NOT NULL DEFAULT 0,term_hash TEXT,reviewer TEXT,reference TEXT,approved_at TEXT);
    INSERT OR IGNORE INTO legal_approval(id) VALUES(1);
    CREATE TABLE IF NOT EXISTS banking(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS signed_terms(id TEXT PRIMARY KEY,reservation_id TEXT NOT NULL UNIQUE REFERENCES reservations(id),pdf BLOB NOT NULL,sha256 TEXT NOT NULL,term_hash TEXT NOT NULL,uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,validated_at TEXT,reviewer TEXT,validation_reference TEXT);

  `);
  db.prepare("INSERT OR IGNORE INTO settings(id,value) VALUES(1,?)").run(
    JSON.stringify({
      pricingEnabled: false,
      cleaningFeeCents: 0,
      depositPercent: 20,
      maxGuests: 6,
      whatsappNumber: "5583986705999",
      email: "priscillacahinoo@gmail.com",
      googleMapsUrl: "https://maps.app.goo.gl/QdquwUhCt9KzitQr8",
      mapsEmbedUrl: "",
    }),
  );
  const cols = db.prepare('PRAGMA table_info(payments)').all().map(c=>c.name);
  for (const [name,type] of [['settled','INTEGER NOT NULL DEFAULT 0'],['method','TEXT'],['bank_reference','TEXT']]) if(!cols.includes(name)) db.exec(`ALTER TABLE payments ADD COLUMN ${name} ${type}`);
  db.prepare('INSERT OR IGNORE INTO banking(id,value) VALUES(1,?)').run(JSON.stringify({bank:'',holder:'',holderDocument:'',branch:'',account:'',accountType:'',pixKey:''}));
  const config=JSON.parse(db.prepare('SELECT value FROM settings WHERE id=1').get().value);
  config.depositPercent=20;
  db.prepare('UPDATE settings SET value=? WHERE id=1').run(JSON.stringify(config));
  db.exec('PRAGMA user_version=2');
  return db;
}
