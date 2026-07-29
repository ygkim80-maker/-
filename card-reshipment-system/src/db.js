const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, '..', 'data', 'reshipment.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS shipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_no TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  card_type TEXT NOT NULL,
  branch TEXT NOT NULL,
  original_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_transit',
  return_reason TEXT DEFAULT '수취인부재',
  returned_at TEXT,
  notify_attempts INTEGER NOT NULL DEFAULT 0,
  last_notified_at TEXT,
  response_token TEXT UNIQUE,
  response_choice TEXT,
  new_address TEXT,
  preferred_date TEXT,
  responded_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id),
  channel TEXT NOT NULL,
  provider TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_logs_shipment ON notification_logs(shipment_id);
`);

module.exports = db;
