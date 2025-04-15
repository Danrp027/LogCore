const Estoque = require("../models/Estoque");
const db = require("../database/db");

const estoque = new Estoque(db);

module.exports = {
  async listar(req, res) {
    const dados = await estoque.listarTodos();
    res.json(dados);
  },

  async criar(req, res) {
    const { nome, quantidade, unidade } = req.body;
    const novo = await estoque.criar({ nome, quantidade, unidade });
    res.status(201).json(novo);
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { nome, quantidade, unidade } = req.body;
    const atualizado = await estoque.atualizar(id, { nome, quantidade, unidade });
    res.json(atualizado);
  },

  async deletar(req, res) {
    const { id } = req.params;
    await estoque.deletar(id);
    res.json({ sucesso: true });
  }
};
