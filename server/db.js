import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

function addColumnIfMissing(db, table, name, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
}

export function openDatabase(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  if (path !== ":memory:") { try { chmodSync(path, 0o600); } catch {} }
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    PRAGMA busy_timeout=5000;
    PRAGMA secure_delete=ON;

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id=1),
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rates (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      weekday_cents INTEGER NOT NULL CHECK(weekday_cents>0),
      weekend_cents INTEGER NOT NULL CHECK(weekend_cents>0),
      min_nights INTEGER NOT NULL CHECK(min_nights>0),
      CHECK(start_date < end_date)
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      request_key TEXT UNIQUE,
      request_hash TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL,
      has_pet INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('requested','confirmed','cancelled','blocked')),
      quote TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK(check_in < check_out)
    );
    CREATE INDEX IF NOT EXISTS reservations_dates ON reservations(check_in,check_out,status);

    CREATE TABLE IF NOT EXISTS reservation_holds (
      reservation_id TEXT PRIMARY KEY REFERENCES reservations(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS reservation_holds_expiry ON reservation_holds(expires_at);

    CREATE TABLE IF NOT EXISTS reservation_events (
      id INTEGER PRIMARY KEY,
      reservation_id TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      event TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'system',
      details_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS reservation_events_reservation ON reservation_events(reservation_id,id);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      dates TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      reservation_id TEXT NOT NULL REFERENCES reservations(id),
      amount_cents INTEGER NOT NULL CHECK(amount_cents != 0),
      note TEXT NOT NULL,
      settled INTEGER NOT NULL DEFAULT 0 CHECK(settled IN (0,1)),
      method TEXT,
      bank_reference TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'system',
      request_id TEXT,
      details_json TEXT NOT NULL DEFAULT '{}',
      previous_hash TEXT,
      entry_hash TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rate_limits (
      key_hash TEXT PRIMARY KEY,
      scope TEXT NOT NULL,
      count INTEGER NOT NULL,
      window_until INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(window_until);
    CREATE TABLE IF NOT EXISTS legal_approval(
      id INTEGER PRIMARY KEY CHECK(id=1),
      approved INTEGER NOT NULL DEFAULT 0,
      term_hash TEXT,
      reviewer TEXT,
      reference TEXT,
      approved_at TEXT
    );
    CREATE TABLE IF NOT EXISTS banking(
      id INTEGER PRIMARY KEY CHECK(id=1),
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS signed_terms(
      id TEXT PRIMARY KEY,
      reservation_id TEXT NOT NULL UNIQUE REFERENCES reservations(id),
      pdf BLOB NOT NULL,
      sha256 TEXT NOT NULL,
      term_hash TEXT NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      validated_at TEXT,
      reviewer TEXT,
      validation_reference TEXT
    );
  `);

  // Safe migrations from the previous schema.
  for (const [name, def] of [
    ["settled", "INTEGER NOT NULL DEFAULT 0"],
    ["method", "TEXT"],
    ["bank_reference", "TEXT"],
  ]) addColumnIfMissing(db, "payments", name, def);
  for (const [name, def] of [
    ["actor", "TEXT NOT NULL DEFAULT 'system'"],
    ["request_id", "TEXT"],
    ["details_json", "TEXT NOT NULL DEFAULT '{}'"],
    ["previous_hash", "TEXT"],
    ["entry_hash", "TEXT"],
  ]) addColumnIfMissing(db, "audit", name, def);

  const defaults = {
    pricingEnabled: false,
    cleaningFeeCents: 0,
    depositPercent: 20,
    maxGuests: 6,
    minLeadDays: 0,
    maxAdvanceDays: 1825,
    maxNights: 30,
    requestHoldMinutes: 30,
    whatsappNumber: "",
    email: "",
    googleMapsUrl: "",
    mapsEmbedUrl: "",
  };
  db.prepare("INSERT OR IGNORE INTO settings(id,value) VALUES(1,?)").run(JSON.stringify(defaults));
  const currentSettings = JSON.parse(db.prepare("SELECT value FROM settings WHERE id=1").get().value);
  const mergedSettings = { ...defaults, ...currentSettings };
  db.prepare("UPDATE settings SET value=? WHERE id=1").run(JSON.stringify(mergedSettings));

  db.prepare("INSERT OR IGNORE INTO legal_approval(id) VALUES(1)").run();
  db.prepare("INSERT OR IGNORE INTO banking(id,value) VALUES(1,?)").run(JSON.stringify({
    bank: "", holder: "", holderDocument: "", branch: "", account: "", accountType: "", pixKey: "",
  }));

  const duplicate = db.prepare(`
    SELECT method, bank_reference, COUNT(*) n
    FROM payments
    WHERE bank_reference IS NOT NULL AND bank_reference <> ''
    GROUP BY method, bank_reference
    HAVING COUNT(*) > 1
    LIMIT 1
  `).get();
  if (duplicate) {
    throw new Error("Há referências bancárias duplicadas no histórico. Faça conciliação antes de iniciar a versão endurecida.");
  }
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS payments_bank_reference_unique
    ON payments(method, bank_reference)
    WHERE bank_reference IS NOT NULL AND bank_reference <> '';`);

  db.exec("PRAGMA user_version=5");
  return db;
}
