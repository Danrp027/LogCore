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

function gerarCodigoPedido() {
  const timestamp = Date.now();
  return `PED-${timestamp}`;
}



//Modulo 1 Estrutura Inicial Usuarios.
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
// Fim do Modulo 1

// Modulo 2 Estoque Produtos.
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

// Fim Modulo 2.

//Modulo 3 Entregas.  motoristas, veiculos, pedidos e entregas.

//Motoristas
app.get("/listar-motoristas", (req, res) => {
  const query = `
    SELECT * FROM Motoristas
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar Motoristas:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os Motoristas. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.post("/criar-motorista", (req, res) => {
  const { nome, telefone, cpf, cnh } = req.body;

  const query = `
    INSERT INTO Motoristas (nome, telefone, cpf, cnh)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [nome, telefone, cpf, cnh], (err) => {
    if (err) {
      console.error("Erro ao inserir Motorista:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar inserir Motorista. Verifique os dados e tente novamente."
        );
    }
    res.send("Motorista inserido com sucesso!");
  });
});

app.get("/detalhes-motorista-cpf", (req, res) => {
  const cpf = req.query.cpf;

  const query = "SELECT * FROM Motoristas WHERE cpf = ?";

  db.all(query, [cpf], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar Motorista pelo CPF:", err);
      return res
        .status(500)
        .send("Erro ao buscar Motorista. Verifique o CPF e tente novamente.");
    }
    res.json(rows);
  });
});

app.get("/detalhes-motorista-nome", (req, res) => {
  const nome = req.query.nome;

  const query = `
    SELECT * FROM Motoristas
    WHERE nome LIKE ?
  `;

  db.all(query, [`%${nome}%`], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar Motorista pelo nome:", err);
      return res
        .status(500)
        .send("Erro ao buscar Motorista. Verifique o nome e tente novamente.");
    }
    res.json(rows);
  });
});

app.put("/atualizar-motorista", (req, res) => {
  const { nome, telefone, cpf, cnh } = req.body;

  const query = `
    UPDATE Motoristas
    SET nome = ?, telefone = ?, cpf = ?, cnh = ?
    WHERE cpf = ?
  `;

  db.run(query, [nome, telefone, cpf, cnh], (err) => {
    if (err) {
      console.error("Erro ao atualizar Motorista:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar atualizar o Motorista. Tente novamente mais tarde."
        );
    }
    res.send("Motorista atualizado com sucesso!");
  });
});

app.delete("/deletar-motorista/:cpf", (req, res) => {
  const { cpf } = req.params;

  const query = "DELETE FROM Motoristas WHERE cpf = ?";

  db.run(query, [cpf], (err) => {
    if (err) {
      console.error("Erro ao deletar motorista:", err);
      return res
        .status(500)
        .send("Erro ao deletar motorista. Verifique o cpf e tente novamente.");
    }
    res.send("Motorista deletado com sucesso!");
  });
});
//Fim Motorista

//Veiculos
app.get("/veiculos", (req, res) => {
  const query = `
  SELECT v.*, m.nome AS nome_motorista
  FROM veiculos v
  LEFT JOIN motoristas m ON v.motorista_id = m.id
`;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar veiculos:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os veiculos. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.post("/veiculos", (req, res) => {
  const { placa, modelo, ano, motorista_id } = req.body;

  const query = `
    INSERT INTO Veiculos (placa, modelo, ano, motorista_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [placa, modelo, ano, motorista_id], (err) => {
    if (err) {
      console.error("Erro ao inserir Veiculo:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar inserir o Veiculo. Verifique os dados e tente novamente."
        );
    }
    res.send("Veiculo inserido com sucesso!");
  });
});

app.get("/veiculos-placa", (req, res) => {
  const placa = req.query.placa;

  const query = `
    SELECT veiculos.*, motoristas.nome AS nome_motorista
    FROM veiculos
    LEFT JOIN motoristas ON veiculos.motorista_id = motoristas.id
    WHERE veiculos.placa = ?
  `;

  db.all(query, [placa], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar Veiculo pela placa:", err);
      return res
        .status(500)
        .send("Erro ao buscar veiculo. Verifique a placa e tente novamente.");
    }
    res.json(rows);
  });
});

app.get("/veiculos-modelo", (req, res) => {
  const modelo = req.query.modelo;

  const query = `
    SELECT * FROM Veiculos
    WHERE modelo LIKE ?
  `;

  db.all(query, [`%${modelo}%`], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar Veiculo pelo modelo:", err);
      return res
        .status(500)
        .send("Erro ao buscar veiculo. Verifique o nome e tente novamente.");
    }
    res.json(rows);
  });
});

app.put("/veiculos/:placa", (req, res) => {
  const { placa } = req.params;
  const { modelo, ano, motorista_id } = req.body;

  const query = `
    UPDATE Veiculos
    SET modelo = ?, ano = ?, motorista_id = ?
    WHERE placa = ?
  `;

  db.run(query, [modelo, ano, motorista_id, placa], (err) => {
    if (err) {
      console.error("Erro ao atualizar veiculo:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar atualizar o Veiculo. Tente novamente mais tarde."
        );
    }
    res.send("Veiculo atualizado com sucesso!");
  });
});

app.delete("/veiculos/:placa", (req, res) => {
  const { placa } = req.params;

  const query = "DELETE FROM Veiculos WHERE placa = ?";

  db.run(query, [placa], (err) => {
    if (err) {
      console.error("Erro ao deletar veiculo:", err);
      return res
        .status(500)
        .send("Erro ao deletar veiculo. Verifique a placa e tente novamente.");
    }
    res.send("Veiculo deletado com sucesso!");
  });
});
//Fim Veiculos.

//Pedidos
app.get("/pedidos", (req, res) => {
  const query = `
    SELECT * FROM Pedidos
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar pedidos:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar os pedidos. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.post("/pedidos", (req, res) => {
  
  const { cliente_nome, endereco_entrega, data_entrega, status } = req.body;
const codigo = gerarCodigoPedido();

  const query = `
    INSERT INTO Pedidos (cliente_nome, endereco_entrega, data_entrega, status, codigo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [cliente_nome, endereco_entrega, data_entrega, status, codigo],
    (err) => {
      if (err) {
        console.error("Erro ao inserir pedido:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar inserir o pedido. Verifique os dados e tente novamente."
          );
      }
      res.send("Pedido inserido com sucesso!");
    }
  );
});

app.get("/pedidos-data", (req, res) => {
  const { data_entrega } = req.query;

  const query = `
    SELECT * FROM pedidos
    WHERE data_entrega = ?
  `;

  db.all(query, [data_entrega], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produto pela data:", err);
      return res
        .status(500)
        .send("Erro ao buscar pedido. Verifique a data e tente novamente.");
    }
    res.json(rows);
  });
});

app.get("/pedidos-codigo", (req, res) => {
  const codigo = req.query.codigo;

  const query = `
    SELECT * FROM Pedidos
    WHERE codigo LIKE ?
  `;

  db.all(query, [`%${codigo}%`], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar pelo N° do Pedido:", err);
      return res
        .status(500)
        .send("Erro ao buscar N° do pedido. Verifique o nome do codigo e tente novamente.");
    }
    res.json(rows);
  });
});

app.put("/pedidos/:codigo", (req, res) => {
  const { codigo } = req.params;
  const { cliente_nome, endereco_entrega, data_entrega, status } =
    req.body;

  const query = `
    UPDATE Pedidos
    SET cliente_nome = ?, endereco_entrega = ?, data_entrega = ?, status = ?
    WHERE codigo = ?
  `;

  db.run(
    query,
    [cliente_nome, endereco_entrega, data_entrega, status, codigo],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar pedido:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar atualizar o pedido. Tente novamente mais tarde."
          );
      }
      res.send("Pedido atualizado com sucesso!");
    }
  );
});

app.delete("/pedidos/:codigo", (req, res) => {
  const { codigo } = req.params;

  const query = "DELETE FROM Pedidos WHERE codigo = ?";

  db.run(query, [codigo], (err) => {
    if (err) {
      console.error("Erro ao deletar pedido:", err);
      return res
        .status(500)
        .send("Erro ao deletar pedido. Verifique o código e tente novamente.");
    }
    res.send("Pedido deletado com sucesso!");
  });
});
// Fim Pedidos.

//Entregas
app.get("/entregas", (req, res) => {
  const query = `
    SELECT * FROM Entregas
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao listar as entregas:", err);
      return res
        .status(500)
        .send(
          "Ocorreu um erro ao tentar listar as entregas. Tente novamente mais tarde."
        );
    }
    res.json(rows);
  });
});

app.post("/entregas", (req, res) => {
  
  const { pedido_id, motorista_id, data_envio, data_entrega } = req.body;


  const query = `
    INSERT INTO Entregas (pedido_id, motorista_id, data_envio, data_entrega)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    query,
    [pedido_id, motorista_id, data_envio, data_entrega],
    (err) => {
      if (err) {
        console.error("Erro ao inserir entrega:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar inserir a entrega. Verifique os dados e tente novamente."
          );
      }
      res.send("Entrega inserido com sucesso!");
    }
  );
});

app.get("/entregas-data", (req, res) => {
  const { data_envio } = req.query;

  const query = `
    SELECT * FROM Entregas
    WHERE data_envio = ?
  `;

  db.all(query, [data_envio], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar produto pela data de emvio:", err);
      return res
        .status(500)
        .send("Erro ao buscar pedido. Verifique a data e tente novamente.");
    }
    res.json(rows);
  });
});

app.get("/pedidos-codigo", (req, res) => {
  const codigo = req.query.codigo;

  const query = `
    SELECT * FROM Pedidos
    WHERE codigo LIKE ?
  `;

  db.all(query, [`%${codigo}%`], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar pelo N° do Pedido:", err);
      return res
        .status(500)
        .send("Erro ao buscar N° do pedido. Verifique o nome do codigo e tente novamente.");
    }
    res.json(rows);
  });
});

app.put("/pedidos/:codigo", (req, res) => {
  const { codigo } = req.params;
  const { cliente_nome, endereco_entrega, data_entrega, status } =
    req.body;

  const query = `
    UPDATE Pedidos
    SET cliente_nome = ?, endereco_entrega = ?, data_entrega = ?, status = ?
    WHERE codigo = ?
  `;

  db.run(
    query,
    [cliente_nome, endereco_entrega, data_entrega, status, codigo],
    (err) => {
      if (err) {
        console.error("Erro ao atualizar pedido:", err);
        return res
          .status(500)
          .send(
            "Ocorreu um erro ao tentar atualizar o pedido. Tente novamente mais tarde."
          );
      }
      res.send("Pedido atualizado com sucesso!");
    }
  );
});

app.delete("/pedidos/:codigo", (req, res) => {
  const { codigo } = req.params;

  const query = "DELETE FROM Pedidos WHERE codigo = ?";

  db.run(query, [codigo], (err) => {
    if (err) {
      console.error("Erro ao deletar pedido:", err);
      return res
        .status(500)
        .send("Erro ao deletar pedido. Verifique o código e tente novamente.");
    }
    res.send("Pedido deletado com sucesso!");
  });
});

app.listen(3000, console.log("Rodando... http://localhost:3000"));
