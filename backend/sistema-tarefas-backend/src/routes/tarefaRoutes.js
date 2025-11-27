// src/routes/tarefaRoutes.js
const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');

// CRUD completo
router.get('/', tarefaController.listar);             // listar todas
router.get('/:id', tarefaController.buscarPorId);     // buscar por id
router.post('/', tarefaController.criar);             // criar
router.put('/:id', tarefaController.atualizar);       // atualizar tudo (inclusive usuário)
router.put('/:id/status', tarefaController.atualizarStatus); // só status (atalho)
router.delete('/:id', tarefaController.deletar);      // deletar

module.exports = router;
