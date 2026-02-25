const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'database', 'roompilot.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    role       TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS designs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    code        TEXT NOT NULL,
    name        TEXT NOT NULL,
    width       TEXT,
    length      TEXT,
    height      TEXT,
    wall_color  TEXT,
    floor_color TEXT,
    items       TEXT,
    date        TEXT DEFAULT (date('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

module.exports = db
