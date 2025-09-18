const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

db.connect(err=>{
  if(err){ console.error("❌ Error MySQL:",err); return; }
  console.log("✅ Conectado a MySQL");

  const query = `
    CREATE TABLE IF NOT EXISTS respuestas1(
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      age INT NOT NULL,
      grupo VARCHAR(50) NOT NULL,
      escuela VARCHAR(100) NOT NULL,
      correctCount INT,
      incorrectCount INT,
      correctAnswers TEXT,
      incorrectAnswers TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(query, (err)=>{ if(err) console.error("❌ Error creando tabla:",err); else console.log("✅ Tabla lista"); });
});

app.post("/respuestas1",(req,res)=>{
  console.log("Datos recibidos:", req.body);
  const {username, age, grupo, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers} = req.body;
  if(!username||!age||!grupo||!school) return res.status(400).json({error:"Datos incompletos"});
  const query = `INSERT INTO respuestas1 (username,age,grupo,escuela,correctCount,incorrectCount,correctAnswers,incorrectAnswers) VALUES (?,?,?,?,?,?,?,?)`;
  db.query(query,[username, age, grupo, school, correctCount, incorrectCount, correctAnswers, incorrectAnswers],
    (err)=>{
      if(err){ console.error("❌ Error guardando:",err); return res.status(500).json({error:"Error guardando"});}
      res.json({message:"✅ Respuestas guardadas correctamente", correctAnswers, incorrectAnswers});
    });
});

app.get("/respuestas1",(req,res)=>{
  db.query("SELECT * FROM respuestas1 ORDER BY created_at DESC",(err,rows)=>{
    if(err){ console.error(err); return res.status(500).json({error:"Error obteniendo respuestas"});}
    res.json(rows);
  });
});

app.listen(port,()=>console.log(`🚀 Servidor escuchando en http://localhost:${port}`));



