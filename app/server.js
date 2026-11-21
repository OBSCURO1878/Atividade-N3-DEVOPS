const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0';

// Configuração MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'senha123',
  database: process.env.DB_NAME || 'loja'
};

// Configuração Redis
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

let pool;

async function init() {
  pool = mysql.createPool(dbConfig);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      preco DECIMAL(10,2) NOT NULL
    )
  `);
  await redisClient.connect();
}

// Rota de saúde exigida
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redisClient.ping();
    res.status(200).json({ status: 'OK', version: APP_VERSION });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// Rota raiz (útil para evidenciar mudança da v1.0 para v2.0)
app.get('/', (req, res) => {
  res.json({ mensagem: `API Loja rodando - Versão 2.0 (Atualizada!)` });
});

// Listar produtos (com cache Redis)
app.get('/produtos', async (req, res) => {
  const cache = await redisClient.get('produtos');
  if (cache) {
    return res.json({ origem: 'redis-cache', dados: JSON.parse(cache) });
  }
  const [rows] = await pool.query('SELECT * FROM produtos');
  await redisClient.setEx('produtos', 30, JSON.stringify(rows));
  res.json({ origem: 'mysql', dados: rows });
});

// Criar produto (persiste no MySQL e limpa cache)
app.post('/produtos', async (req, res) => {
  const { nome, preco } = req.body;
  const [result] = await pool.query('INSERT INTO produtos (nome, preco) VALUES (?, ?)', [nome, preco]);
  await redisClient.del('produtos');
  res.status(201).json({ id: result.insertId, nome, preco });
});

init()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} (v${APP_VERSION})`));
  })
  .catch((err) => {
    console.error('Erro ao iniciar dependências:', err);
    process.exit(1);
  });
