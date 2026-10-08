-- CRM schema for the jayniche-crm D1 database.
-- Applied once; add new numbered files for later changes.

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'website',      -- website, facebook, phone, referral, other
  source_page TEXT,
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  condition TEXT,
  listed TEXT,
  occupancy TEXT,
  timeline TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'Warm',        -- Hot, Warm, Cold
  status TEXT NOT NULL DEFAULT 'New',
  follow_up TEXT,                               -- YYYY-MM-DD
  property_type TEXT,
  beds TEXT,
  baths TEXT,
  asking_price INTEGER,
  est_value INTEGER,                            -- after-repair value estimate
  repair_estimate INTEGER,
  mortgage_owing INTEGER,
  offer_amount INTEGER,
  motivation TEXT
);
CREATE INDEX IF NOT EXISTS leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  body TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS notes_lead ON notes(lead_id);

-- Single-user settings: password hash and salt.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Login sessions. Only a SHA-256 hash of the cookie token is stored.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

-- Simple fixed-window rate limits (form spam, login guessing). Keys are hashed.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
