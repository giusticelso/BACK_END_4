const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const SECRET_KEY = 'sua_chave_secreta_super_segura';

// Conexão com o banco de dados sabordigital
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sabordigital'
});

// Rota de Cadastro de Usuário (Criptografa a senha antes de salvar)
app.post('/register', async (req, res) => {
  const { nome, email, senha, papel } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    await db.execute(
      'INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, papel || 'cliente']
    );
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cadastrar', error: err.message });
  }
});

// Rota de Login usando a tabela 'usuario'
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    // Valida a senha digitada com a senha hash do banco
    const passwordMatch = await bcrypt.compare(senha, user.senha);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    // Inclui o 'papel' no payload para controle de acesso
    const token = jwt.sign(
      { id: user.id, email: user.email, papel: user.papel },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    return res.json({ token, papel: user.papel });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

// Middleware para verificar se o token é válido
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acesso negado' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = decoded; // { id, email, papel }
    next();
  });
}

// Middleware para restringir rotas exclusivas de Admin
function isAdmin(req, res, next) {
  if (req.user.papel !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito para administradores' });
  }
  next();
}

// Exemplo de rota pública (cardápio)
app.get('/produtos', async (req, res) => {
  const [produtos] = await db.execute('SELECT * FROM produto WHERE disponivel = true');
  res.json(produtos);
});

// Exemplo de rota protegida (Apenas Admin pode criar produtos)
app.post('/produtos', verifyToken, isAdmin, async (req, res) => {
  const { nome, descricao, preco, categoria } = req.body;
  await db.execute(
    'INSERT INTO produto (nome, descricao, preco, categoria) VALUES (?, ?, ?, ?)',
    [nome, descricao, preco, categoria]
  );
  res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));