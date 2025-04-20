const express = require("express");
const path = require("path");
const sqlite = require("sqlite3").verbose();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const app = express();

const db = new sqlite.Database("LogCore.sqlite");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function Criar_tabela_Usuarios() {
  const query = `
    CREATE TABLE Usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL 
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Usuarios();

function Criar_tabela_Motoristas() {
  const query = `
    CREATE TABLE Motoristas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT,
        cpf TEXT NOT NULL UNIQUE,
        cnh TEXT NOT NULL
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Motoristas();
function Criar_tabela_Veiculos() {
  const query = `
    CREATE TABLE Veiculos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placa TEXT NOT NULL UNIQUE,
        modelo TEXT NOT NULL,
        ano INTEGER,
        motorista_id INTEGER,
        FOREIGN KEY (motorista_id) REFERENCES Motoristas(id)
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Veiculos();
function Criar_tabela_Produtos() {
  const query = `
    CREATE TABLE Produtos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        quantidade_estoque INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 0,
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Produtos();

function Criar_tabela_Pedidos() {
  const query = `
    CREATE TABLE Pedidos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_nome TEXT NOT NULL,
        endereco_entrega TEXT NOT NULL,
        data_entrega DATE NOT NULL,
        staus TEXT CHECK(status IN ('Pendente', 'Em trânsito', 'Entregue')) DEFAULT 'Pendente'
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Pedidos();

function Criar_tabela_ItensPedidos() {
  const query = `
    CREATE TABLE Itens_Pedidos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER,
        produto_id INTEGER,
        quantidade INTEGER NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES Pedidos(id),
        FOREIGN KEY (produto_id) REFERENCES Produtos(id)
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_ItensPedidos();

function Criar_tabela_Agendamentos() {
  const query = `
    CREATE TABLE Agendamentos_CargaDescarga(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        veiculo_id INTEGER,
        data_hora DATETIME NOT NULL,
        status TEXT CHECK(status IN ('Confirmado', 'Aguardando', 'Concluído)) DEFAULT 'Aguardando',
        FOREIGN KEY (veiculo_id) REFERENCES Veiculos(id)
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Agendamentos();

function Criar_tabela_Manutencao() {
  const query = `
    CREATE TABLE Manutencoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        veiculo_id INTEGER,
        descricao TEXT NOT NULL,
        data_prevista DATE NOT NULL,
        data_realizada DATE,
        tipo TEXT CHECK(tipo IN ('Preventiva', 'Corretiva')) NOT NULL,
        FOREIGN KEY (veiculo_id) REFERENCES Veiculos(id)
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Manutencao();

function Criar_tabela_Entregas() {
  const query = `
    CREATE TABLE Entregas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER,
        motorista_id INTEGER,
        data_envio DATE NOT NULL,
        data_entrega DATE,
        status TEXT CHECK(status IN ('Pendente', 'Em Trânsito', 'Entregue')) DEFAULT 'Pendente',
        FOREIGN KEY (pedido_id) REFERENCES Pedidos(id),
        FOREIGN KEY (motorista_id) REFERENCES Motoristas(id)
    )
`;

  db.run(query, (err) => {
    if (err) console.log(err);
    else console.log("Tabela Criada com Sucesso!");
  });
}

//Criar_tabela_Entregas();

app.get("/listar-usuarios", (req, res) => {
  const query = `
  SELECT nome, email, matricula FROM Usuarios
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar Usuarios:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os Usuarios. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.post("/addusuarios", (req, res) => {
  const { nome, email, senha, matricula } = req.body;

  bcrypt.hash(senha, 10).then((senhaCriptografada) => {
    const query = `INSERT INTO Usuarios (nome, email, senha, matricula) VALUES (?, ?, ?, ?)`;

    db.run(query, [nome, email, senhaCriptografada, matricula], (err) => {
      if (err) {
        console.error("Erro ao inserir Usuario:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar inserir o Usuario. Verifique os dados e tente novamente."
          );
      }
      res.send("Usuario Cadastrado com sucesso!");
    });
  });
});

app.get("/usuario-especifico", (req, res) => {
  const nome = req.query.nome;

  const query = `
  SELECT nome, email, matricula FROM Usuarios
  WHERE nome LIKE ?
`;


  db.all(query, [`%${nome}%`], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar usuario pelo nome:", err);
      return res
        .status(500)
        .send("Erro ao buscar usuario. Verifique o nome e tente novamente.");
    }
    res.json(rows);
  });
});

app.put("/atualizar-usuarios", (req, res) => {
  const { email, senha } = req.body;

  bcrypt.hash(senha, 10).then((senhaCriptografada) => {
    const query = `
    UPDATE Usuarios
    SET senha = ?
    WHERE email = ?
  `;

    db.run(query, [senhaCriptografada, email], (err) => {
      if (err) {
        console.error("Erro ao atualizar Usuario:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar atualizar o usuario. Tente novamente mais tarde."
          );
      }
      res.send("Usuario atualizado com sucesso!");
    });
  });
});

app.delete("/remover-usuario/:matricula", (req, res) => {
  const { matricula } = req.params;

  const query = "DELETE FROM Usuarios WHERE matricula = ?";

  db.run(query, [matricula], (err) => {
    if (err) {
      console.error("Erro ao deletar Usuario:", err);
      return res
        .status(500)
        .send(
          "Erro ao deletar usuario. Verifique se está correto e tente novamente."
        );
    }
    res.send("Usuario deletado com sucesso!");
  });
});

app.get("/listar-estoque", (req, res) => {
  const query = `
    SELECT * FROM Produtos
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar produtos:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os produtos. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.get("/estoque-minimo", (req, res) => {
  const query = `
    SELECT * FROM Produtos
    WHERE quantidade_estoque < estoque_minimo
    ORDER BY nome ASC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar produtos:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os produtos. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.post("/addprodutos", (req, res) => {
  const { nome, descricao, quantidade_estoque, estoque_minimo, codigo } =
    req.body;

  const query = `
    INSERT INTO Produtos (nome, descricao, quantidade_estoque, estoque_minimo, codigo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [nome, descricao, quantidade_estoque, estoque_minimo, codigo],
    (err) => {
      if (err) {
        console.error("Erro ao inserir produto:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar inserir o produto. Verifique os dados e tente novamente."
          );
      }
      res.send("Produto inserido com sucesso!");
    }
  );
});

app.get("/detalhes-produto-codigo", (req, res) => {
  const codigo = req.query.codigo;

  const query = "SELECT * FROM Produtos WHERE codigo = ?";

  db.all(query, [codigo], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produto pelo código:", err);
      return res
        .status(500)
        .send("Erro ao buscar produto. Verifique o código e tente novamente.");
    }
    res.json(rows);
  });
});

app.get("/detalhes-produto-nome", (req, res) => {
  const nome = req.query.nome;

  const query = `
    SELECT * FROM Produtos
    WHERE nome LIKE ?
  `;

  db.all(query, [`%${nome}%`], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produto pelo nome:", err);
      return res
        .status(500)
        .send("Erro ao buscar produto. Verifique o nome e tente novamente.");
    }
    res.json(rows);
  });
});

app.put("/atualizar-produtos", (req, res) => {
  const { nome, descricao, quantidade_estoque, estoque_minimo, codigo } =
    req.body;

  const query = `
    UPDATE Produtos
    SET nome = ?, descricao = ?, quantidade_estoque = ?, estoque_minimo = ?
    WHERE codigo = ?
  `;

  db.run(
    query,
    [nome, descricao, quantidade_estoque, estoque_minimo, codigo],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar produto:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar atualizar o produto. Tente novamente mais tarde."
          );
      }
      res.send("Produto atualizado com sucesso!");
    }
  );
});

app.delete("/deletar-produto/:codigo", (req, res) => {
  const { codigo } = req.params;

  const query = "DELETE FROM Produtos WHERE codigo = ?";

  db.run(query, [codigo], (err) => {
    if (err) {
      console.error("Erro ao deletar produto:", err);
      return res
        .status(500)
        .send("Erro ao deletar produto. Verifique o código e tente novamente.");
    }
    res.send("Produto deletado com sucesso!");
  });
});

// Fim Produtos Daniel

//Parte do Daniel

app.get("/itens-pedido", (req, res) => {
  const query = `
       SELECT
  Itens_Pedido.id,
  Itens_Pedido.quantidade,
  Itens_Pedido.pedido_id,
  Produtos.nome AS produto_nome
FROM Itens_Pedido
JOIN Produtos ON Itens_Pedido.produto_id = Produtos.id;

        `;

  db.all(query, [], (err, rows) => {
    if (err) res.send(err);
    else res.json(rows);
  });
});

app.post("/itens-pedido", (req, res) => {
  console.log("Dados recebidos no backend:", req.body);

  var pedido_id = req.body.pedido_id;
  var produto_id = req.body.produto_id;
  var quantidade = req.body.quantidade;

  var query =
    "INSERT INTO Itens_Pedido(pedido_id, produto_id, quantidade) VALUES(?, ?, ?);";

  db.run(query, [pedido_id, produto_id, quantidade], (err) => {
    if (err) res.send(err);
    else res.send("Detalhes do pedidos Inseridos!");
  });
});

app.get("/itens-pedido/:id", (req, res) => {
  var pedidoid = req.params.id;

  var query = "SELECT * FROM Itens_Pedido WHERE id = ?";

  db.all(query, [pedidoid], (err, rows) => {
    if (err) res.send(err);
    else res.json(rows);
  });
});

app.put("/itens-pedido/:id", (req, res) => {
  var id = req.params.id;
  var pedido_id = req.body.pedido_id;
  var produto_id = req.body.produto_id;
  var quantidade = req.body.quantidade;

  var query = `
    UPDATE Itens_Pedido
    SET pedido_id = ?, produto_id = ?, quantidade = ?
    WHERE id = ?
`;

  db.run(query, [pedido_id, produto_id, quantidade, id], (err) => {
    if (err) res.send(err);
    else res.send("Item do Pedido Atualizado com Sucesso");
  });
});

app.delete("/itens-pedido/:id", (req, res) => {
  var id = req.params.id;

  var query = "DELETE FROM Itens_Pedido WHERE ID = ?;";

  db.run(query, [id], (err) => {
    if (err) res.send(err);
    else res.send("Item do Pedido Deletado Com Sucesso!");
  });
});

app.get("/agendamentos", (req, res) => {
  const query = `
      SELECT 
            a.id AS agendamento_id,
            a.data_hora,
            a.status,

            v.id AS veiculo_id,
            v.placa,
            v.modelo,
            v.ano,

            m.id AS motorista_id,
            m.nome AS motorista_nome,
            m.telefone AS motorista_telefone,
            m.cpf AS motorista_cpf,
            m.cnh AS motorista_cnh

        FROM Agendamentos_CargaDescarga a
        JOIN Veiculos v ON a.veiculo_id = v.id
        JOIN Motoristas m ON v.motorista_id = m.id
        ORDER BY a.data_hora ASC;


        `;

  db.all(query, [], (err, rows) => {
    if (err) res.send(err);
    else res.json(rows);
  });
});

app.post("/agendamentos", (req, res) => {
  console.log("Dados recebidos no backend:", req.body);

  var data_hora = req.body.data_hora;
  var status = req.body.status;

  var query =
    "INSERT INTO Agendamentos_CargaDescarga(data_hora, status) VALUES(?, ?);";

  db.run(query, [data_hora, status], (err) => {
    if (err) res.send(err);
    else res.send("Agendamento Inseridos!");
  });
});

app.get("/agendamentos/:id", (req, res) => {
  var agendamentoid = req.params.id;

  var query = "SELECT * FROM Agendamentos_CargaDescarga WHERE id = ?";

  db.all(query, [agendamentoid], (err, rows) => {
    if (err) res.send(err);
    else res.json(rows);
  });
});

app.put("/agendamentos/:id", (req, res) => {
  var data_hora = req.body.data_hora;
  var status = req.body.status;

  var query = `
    UPDATE Itens_Pedido
    SET data_hora = ?, status = ?
    WHERE id = ?
`;

  db.run(query, [], (err) => {
    if (err) res.send(err);
    else res.send("Item do Pedido Atualizado com Sucesso");
  });
});

app.delete("/itens-pedido/:id", (req, res) => {
  var id = req.params.id;

  var query = "DELETE FROM Itens_Pedido WHERE ID = ?;";

  db.run(query, [id], (err) => {
    if (err) res.send(err);
    else res.send("Item do Pedido Deletado Com Sucesso!");
  });
});

app.listen(3000, console.log("Rodando... http://localhost:3000"));
