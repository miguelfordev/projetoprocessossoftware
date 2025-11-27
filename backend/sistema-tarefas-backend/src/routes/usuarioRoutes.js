// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// CRUD completo
router.get('/', usuarioController.listar);         // listar todos
router.get('/:id', usuarioController.buscarPorId); // buscar por id
router.post('/', usuarioController.criar);         // criar
router.put('/:id', usuarioController.atualizar);   // atualizar
router.delete('/:id', usuarioController.deletar);  // deletar

module.exports = router;
