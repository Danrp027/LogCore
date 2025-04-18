const express = require('express');
const path = require('path');
const sqlite = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();

const db = new sqlite.Database("LogCore.sqlite");
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
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
        else console.log('Tabela Criada com Sucesso!');
    });
}

//Criar_tabela_Entregas();

//Parte do Joahlan
app.get("/Listar_Usuarios", (req, res) => {

    var sql = "SELECT * FROM USUARIOS";

    db.all(sql, (err, rows) => {
        if (err) res.send("erro");
        else res.json(rows);
    })

});


app.post("/Criar_Novo_Usuario", (req, res) => {

    var nome = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;

    var sql = "INSERT INTO USUARIOS(NOME, EMAIL, SENHA), VALUES(?, ?, ?);";

    db.run(sql, [nome, email, senha], (err) => {
        if (err) res.send("Erro");
        else res.send("Usuario Criado com Sucesso!");
    })

});


app.get("Usuario_Especifico/:nome", (req, res) => {

    var nome = req.params.nome;

    var sql = "SELECT * FROM USUARIOS WHERE NOME = ?";

    db.all(sql, [nome], (err, rows) => {
        if (err) res.send(err, "Erro");
        else res.json(rows);
    })

});


app.put("Atualizar_Usuario/:nome", (req, res) => {

    var nome = req.params.nome;
    var email = req.params.email;
    var senha = req.params.senha;

    var sql = "UPDATE USUARIOS SET NOME = ?, EMAIL = ?, SENHA = ? WHERE NOME = ?";

    db.run(sql, [nome, email, senha], (err) => {
        if (err) res.send(err, "Não foi possível atualizar o usuario");
        else res.send("Registro atualizado com sucesso no usuario = " + nome);
    })
});


app.delete("Remover_Usuario/:nome", (req, res) => {

    var nome = req.params.nome;

    var sql = "DELETE FROM USUARIOS WHERE ID = ?;";

})

// Fim da Parte do Joahlan





















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
    })

});


app.post("/itens-pedido", (req, res) => {
    console.log("Dados recebidos no backend:", req.body);
    
    var pedido_id = req.body.pedido_id;
    var produto_id = req.body.produto_id;
    var quantidade = req.body.quantidade;

    var query = "INSERT INTO Itens_Pedido(pedido_id, produto_id, quantidade) VALUES(?, ?, ?);";


    db.run(query, [pedido_id, produto_id, quantidade], (err) => {
        if (err) res.send(err);
        else res.send("Detalhes do pedidos Inseridos!");
    })

});


app.get("/itens-pedido/:id", (req, res) => {

    var pedidoid = req.params.id;

    var query = "SELECT * FROM Itens_Pedido WHERE id = ?";

    db.all(query, [pedidoid], (err, rows) => {
        if (err) res.send(err);
        else res.json(rows);
    })

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
    })
});


app.delete("/itens-pedido/:id", (req, res) => {

    var id = req.params.id;

    var query = "DELETE FROM Itens_Pedido WHERE ID = ?;";

    db.run(query, [id], (err) => {
        if (err) res.send(err);
        else res.send("Item do Pedido Deletado Com Sucesso!");
    })
});







app.listen(3000, console.log("Rodando... http://localhost:3000"));

