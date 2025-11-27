// src/models/Tarefa.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarefa = sequelize.define('Tarefa', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'),
    defaultValue: 'PENDENTE',
  },
  prazo: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'tarefas',
  timestamps: false,
});

module.exports = Tarefa;
