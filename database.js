const Database = require("better-sqlite3");

const db = new Database("login.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS login_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        login_time TEXT NOT NULL,
        status TEXT NOT NULL
    )
`).run();

console.log("Database ready!");