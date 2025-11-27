// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  tipo: {
    type: DataTypes.ENUM('ENCARREGADO', 'COLABORADOR'),
    allowNull: false,
  }
}, {
  tableName: 'usuarios',
  timestamps: false, // sem createdAt e updatedAt
});

module.exports = Usuario;
