// src/controllers/usuarioController.js
const { Usuario } = require('../models');

module.exports = {
  // LISTAR TODOS
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
  },

  // BUSCAR POR ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      return res.json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
  },

  // CRIAR
  async criar(req, res) {
    try {
      const { nome, email, tipo } = req.body;

      const novo = await Usuario.create({ nome, email, tipo });
      return res.status(201).json(novo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao criar usuário' });
    }
  },

  // ATUALIZAR
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, tipo } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      usuario.nome = nome ?? usuario.nome;
      usuario.email = email ?? usuario.email;
      usuario.tipo = tipo ?? usuario.tipo;

      await usuario.save();

      return res.json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
  },

  // DELETAR
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      await usuario.destroy();

      return res.json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao excluir usuário' });
    }
  }
};
