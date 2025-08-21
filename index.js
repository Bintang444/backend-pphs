const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",     // ganti sesuai user MySQL lo
  password: "",     // isi password MySQL lo
  database: "ecommerce_app"
});

// API tes server
app.get("/", (req, res) => {
  res.send("Backend jalan coy 🚀");
});

// API Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Username, Email, dan Password wajib diisi" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
      (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true, message: "User berhasil daftar" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan Password wajib diisi" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    res.json({ message: "Login berhasil", user: { id: user.id, name: user.name, email: user.email } });
  });
});

app.listen(5000, () => {
  console.log("Server jalan di http://localhost:5000");
});