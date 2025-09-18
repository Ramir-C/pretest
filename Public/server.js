const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public")); // Sirve tu index.html

// Conexión MySQL
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");

  // Crear tabla si no existe
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS respuestas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100),
      age INT,
      grupo VARCHAR(50),
      escuela VARCHAR(100),
      correctCount INT,
      incorrectCount INT,
      correctAnswers TEXT,
      incorrectAnswers TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) console.error("❌ Error creando tabla:", err);
    else console.log("✅ Tabla 'respuestas' lista.");
  });
});

// Guardar respuestas
app.post("/save", (req, res) => {
  const { username, age, group, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers } = req.body;

  const query = `
    INSERT INTO respuestas (username, age, grupo, escuela, correctCount, incorrectCount, correctAnswers, incorrectAnswers)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [username, age, group, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers], (err) => {
    if (err) {
      console.error("❌ Error guardando datos:", err);
      return res.status(500).json({ error: "Error guardando respuestas" });
    }
    res.json({
      message: "✅ Respuestas guardadas correctamente",
      correctCount,
      incorrectCount,
      correctAnswers,
      incorrectAnswers
    });
  });
});

// Consultar respuestas
app.get("/results", (req, res) => {
  db.query("SELECT * FROM respuestas ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error("❌ Error consultando datos:", err);
      return res.status(500).json({ error: "Error obteniendo respuestas" });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
