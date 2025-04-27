const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('LogCore.sqlite', (err) => {
  if (err) {
    console.error("Erro ao conectar no banco de dados:", err);
  } else {
    console.log("Banco de dados conectado com sucesso!");
  }
});

module.exports = db;
