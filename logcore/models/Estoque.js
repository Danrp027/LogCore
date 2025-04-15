class Estoque {
  constructor(db) {
    this.db = db;
    this.db.run(\`
      CREATE TABLE IF NOT EXISTS estoque (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        unidade TEXT NOT NULL,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    \`);
  }

  criar({ nome, quantidade, unidade }) {
    return new Promise((resolve, reject) => {
      this.db.run(
        \`INSERT INTO estoque (nome, quantidade, unidade) VALUES (?, ?, ?)\`,
        [nome, quantidade, unidade],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, nome, quantidade, unidade });
        }
      );
    });
  }

  listarTodos() {
    return new Promise((resolve, reject) => {
      this.db.all(\`SELECT * FROM estoque\`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  atualizar(id, { nome, quantidade, unidade }) {
    return new Promise((resolve, reject) => {
      this.db.run(
        \`UPDATE estoque SET nome = ?, quantidade = ?, unidade = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?\`,
        [nome, quantidade, unidade, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, nome, quantidade, unidade });
        }
      );
    });
  }

  deletar(id) {
    return new Promise((resolve, reject) => {
      this.db.run(\`DELETE FROM estoque WHERE id = ?\`, [id], function (err) {
        if (err) reject(err);
        else resolve({ sucesso: true });
      });
    });
  }
}

module.exports = Estoque;
