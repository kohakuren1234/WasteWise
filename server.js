const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
  })
);

// --- DATABASE ---
const db = new sqlite3.Database("users.db");

// Users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// Reports table
db.run(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )
`);
// --- GET REPORT COUNTS ---
app.get("/report-counts", (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS done
    FROM reports
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error(err);
      return res.json({ total: 0, pending: 0, done: 0 });
    }
    res.json(row);
  });
});

// --- SESSION CHECK ---
function requireLogin(req, res, next) {
  if (!req.session.username) return res.status(401).json({ success: false });
  next();
}

// --- USERS ---
app.get("/get-users", (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    res.json(rows);
  });
});

app.post("/delete-user", (req, res) => {
  const { id } = req.body;
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    res.json({ success: !err });
  });
});


// --- REPORTS ---
app.get("/get-reports", (req, res) => {
  db.all("SELECT * FROM reports ORDER BY created_at ASC", (err, rows) => {
    res.json(rows || []);
  });
});

app.post("/add-report", (req, res) => {
  const { title, description } = req.body;
  db.run(
    "INSERT INTO reports (title, description) VALUES (?, ?)",
    [title, description],
    function(err) {
      res.json({ success: !err, id: this.lastID });
    }
  );
});

app.post("/resolve-report", (req, res) => {
  const { id } = req.body;
  db.get("SELECT status FROM reports WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.json({ success: false });
    const newStatus = row.status === "Pending" ? "Resolved" : "Pending";
    db.run("UPDATE reports SET status=? WHERE id=?", [newStatus, id], (err) => {
      res.json({ success: !err });
    });
  });
});

app.post("/delete-report", (req, res) => {
  const { id } = req.body;
  db.run("DELETE FROM reports WHERE id=?", [id], (err) => {
    res.json({ success: !err });
  });
});


// --- LOGIN & REGISTER ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Missing credentials" });
  }

  db.get(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, user) => {
      if (!user) {
        return res.json({
          success: false,
          message: "Invalid username or password"
        });
      }

      req.session.username = username;
      res.json({
        success: true,
        message: "Login successful",
        redirect: "/dashboard.html"
      });
    }
  );
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: "Missing fields" });
  }

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) {
        return res.json({
          success: false,
          message: "Username already exists"
        });
      }

      res.json({
        success: true,
        message: "Registration successful"
      });
    }
  );
});
/*
function requireLogin(req, res, next) {
  if (!req.session.username) return res.redirect("/"); // back to login
  next();
}

app.get("/dashboard.html", requireLogin, (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

app.get("/check-login", (req, res) => {
  res.json({ loggedIn: !!req.session.username, username: req.session.username });
});

app.get("/dashboard.html", requireLogin, (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});