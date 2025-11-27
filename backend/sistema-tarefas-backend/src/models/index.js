// src/models/index.js
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Tarefa = require('./Tarefa');

// Relacionamentos
Usuario.hasMany(Tarefa, {
  foreignKey: 'usuarioId',
  as: 'tarefas',
});

Tarefa.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'responsavel',
});

const db = {
  sequelize,
  Usuario,
  Tarefa,
};

module.exports = db;
