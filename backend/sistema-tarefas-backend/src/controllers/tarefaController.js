// src/controllers/tarefaController.js
const { Tarefa, Usuario } = require('../models');

module.exports = {
  // LISTAR TODAS
  async listar(req, res) {
    try {
      const tarefas = await Tarefa.findAll({
        include: {
          model: Usuario,
          as: 'responsavel',
          attributes: ['id', 'nome', 'email', 'tipo']
        }
      });
      return res.json(tarefas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao listar tarefas' });
    }
  },

  // BUSCAR POR ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const tarefa = await Tarefa.findByPk(id, {
        include: {
          model: Usuario,
          as: 'responsavel',
          attributes: ['id', 'nome', 'email', 'tipo']
        }
      });

      if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
      }

      return res.json(tarefa);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao buscar tarefa' });
    }
  },

  // CRIAR
  async criar(req, res) {
    try {
      const { titulo, descricao, status, prazo, usuarioId } = req.body;

      const tarefa = await Tarefa.create({
        titulo,
        descricao,
        status,
        prazo,
        usuarioId,
      });

      return res.status(201).json(tarefa);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao criar tarefa' });
    }
  },

  // ATUALIZAR (inclusive reatribuir para outro usuário)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descricao, status, prazo, usuarioId } = req.body;

      const tarefa = await Tarefa.findByPk(id);

      if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
      }

      tarefa.titulo = titulo ?? tarefa.titulo;
      tarefa.descricao = descricao ?? tarefa.descricao;
      tarefa.status = status ?? tarefa.status;
      tarefa.prazo = prazo ?? tarefa.prazo;
      tarefa.usuarioId = usuarioId ?? tarefa.usuarioId;

      await tarefa.save();

      return res.json(tarefa);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
    }
  },

  // ATUALIZAR SÓ O STATUS (atalho, tipo arrastar coluna no Trello)
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const tarefa = await Tarefa.findByPk(id);

      if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
      }

      tarefa.status = status;
      await tarefa.save();

      return res.json(tarefa);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao atualizar status da tarefa' });
    }
  },

  // DELETAR
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const tarefa = await Tarefa.findByPk(id);

      if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
      }

      await tarefa.destroy();

      return res.json({ mensagem: 'Tarefa excluída com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao excluir tarefa' });
    }
  }
};
