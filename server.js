const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// ===============================
// DATABASE
// ===============================

const db = new Database(path.join(__dirname, "login.db"));

db.prepare(`
    CREATE TABLE IF NOT EXISTS login_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        login_time TEXT NOT NULL,
        status TEXT NOT NULL
    )
`).run();


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(express.static(__dirname));


// ===============================
// USER LOGIN
// ===============================

// Temporary user login
const USER_USERNAME = "maha";
const USER_PASSWORD_HASH = bcrypt.hashSync("12345", 10);

app.post("/api/login", async (req, res) => {

    const { username, password } = req.body;

    const loginTime = new Date().toLocaleString("en-IN");

    // Username check
    if (username === USER_USERNAME) {

        const passwordMatch = await bcrypt.compare(
            password,
            USER_PASSWORD_HASH
        );

        // Correct user login
        if (passwordMatch) {

            db.prepare(`
                INSERT INTO login_history
                (username, login_time, status)
                VALUES (?, ?, ?)
            `).run(
                username,
                loginTime,
                "success"
            );

            return res.json({
                success: true,
                message: "Login successful"
            });
        }
    }

    // Failed login
    db.prepare(`
        INSERT INTO login_history
        (username, login_time, status)
        VALUES (?, ?, ?)
    `).run(
        username || "Unknown",
        loginTime,
        "failed"
    );

    return res.status(401).json({
        success: false,
        message: "Wrong username or password"
    });
});


// ===============================
// ADMIN LOGIN
// ===============================

const ADMIN_USERNAME = "kaliyaperumal";
const ADMIN_PASSWORD = "perumal123";

app.post("/api/admin-login", (req, res) => {

    const { username, password } = req.body;

    console.log("Admin login attempt:", username);

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        console.log("Admin login successful");

        return res.json({
            success: true,
            message: "Admin login successful"
        });
    }

    console.log("Admin login failed");

    return res.status(401).json({
        success: false,
        message: "Incorrect username or password"
    });
});


// ===============================
// LOGIN HISTORY
// ===============================

app.get("/api/login-history", (req, res) => {

    const history = db.prepare(`
        SELECT id, username, login_time, status
        FROM login_history
        ORDER BY id DESC
    `).all();

    res.json(history);
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});