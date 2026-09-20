const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!N8N_BASE_URL) {
  console.error("ERRO CRÍTICO: N8N_BASE_URL não está definida no arquivo .env");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("ERRO CRÍTICO: JWT_SECRET não está definida no arquivo .env");
  process.exit(1);
}

// Middlewares essenciais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter Geral (100 requisições / 15 minutos)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', erro: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter para Autenticação (15 requisições / 15 minutos)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { status: 'error', erro: 'Muitas tentativas. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Middleware de Autenticação via JWT em Cookie HttpOnly
function verificarToken(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ status: 'error', erro: 'Acesso não autorizado. Faça login novamente.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', erro: 'Sessão inválida ou expirada.' });
  }
}

// Auxiliar de Proxy para o n8n
async function proxyToN8n(endpoint, req, res) {
  try {
    const targetUrl = `${N8N_BASE_URL.replace(/\/$/, '')}${endpoint}`;
    
    const options = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      'x-proxy-token': 'MINHA_SENHA_SECRETA_DO_PROXY'
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Erro ao comunicar com n8n [${endpoint}]:`, error.message);
    return { status: 500, data: { status: 'error', erro: 'Erro interno ao processar requisição.' } };
  }
}

/* ---------- Rotas Públicas ---------- */

// Login com emissão de Cookie JWT HttpOnly
app.post('/api/login', authLimiter, async (req, res) => {
  const { status, data } = await proxyToN8n('/login', req, res);
  
  if (status === 200 && !data.erro) {
    const userPhone = req.body.telefone || data.telefone;
    const token = jwt.sign({ telefone: userPhone }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });
  }

  return res.status(status).json(data);
});

// Cadastro com emissão de Cookie JWT HttpOnly
app.post('/api/cadastro', authLimiter, async (req, res) => {
  const { status, data } = await proxyToN8n('/cadastro', req, res);

  if (status === 200 && (data.status === 'ok' || !data.erro)) {
    const userPhone = req.body.telefone || data.telefone;
    const token = jwt.sign({ telefone: userPhone }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });
  }

  return res.status(status).json(data);
});

app.post('/api/esqueci-codigo', authLimiter, async (req, res) => {
  const { status, data } = await proxyToN8n('/esqueci-codigo', req, res);
  return res.status(status).json(data);
});

app.post('/api/esqueci-reset', authLimiter, async (req, res) => {
  const { status, data } = await proxyToN8n('/esqueci-reset', req, res);
  return res.status(status).json(data);
});

app.get('/api/ver-orcamento', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ status: 'error', erro: 'ID não fornecido.' });

  try {
    const targetUrl = `${N8N_BASE_URL.replace(/\/$/, '')}/ver-orcamento?id=${encodeURIComponent(id)}`;
    const response = await fetch(targetUrl);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro ao buscar orçamento no n8n:', error.message);
    return res.status(500).json({ status: 'error', erro: 'Erro interno ao consultar orçamento.' });
  }
});

// Logout (Limpa o Cookie HttpOnly)
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ status: 'ok' });
});

/* ---------- Rotas Protegidas (Requerem JWT) ---------- */

app.post('/api/config', verificarToken, async (req, res) => {
  const { status, data } = await proxyToN8n('/config', req, res);
  return res.status(status).json(data);
});

// Servir arquivos estáticos da pasta raiz
app.use(express.static(path.join(__dirname)));

// Fallback 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor OrçaFácil rodando com JWT HttpOnly na porta ${PORT}`);
});
