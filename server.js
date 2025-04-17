
const express = require('express');
const path = require('path');
const app = express();
const estoque = require('./estoque');
const db = require('./db');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/estoque', estoque);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
