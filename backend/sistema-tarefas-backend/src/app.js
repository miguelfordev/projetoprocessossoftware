// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');      // index.js dos models (Usuario, Tarefa, sequelize)
const routes = require('./routes');  // index.js das rotas

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas com prefixo /api
app.use(routes);

// Sincroniza o banco e sobe o servidor
db.sequelize.sync() // se quiser recriar tabelas: { force: true }
  .then(() => {
    console.log('Banco sincronizado com sucesso!');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao sincronizar banco:', error);
  });
