const http = require('http');
const fs = require('fs');
const path = require('path');

const PRODUK_PATH = path.join(__dirname, 'data', 'produk.json');
const USERS_PATH = path.join(__dirname, 'data', 'users.json');

function bacaData() {
  return JSON.parse(fs.readFileSync(PRODUK_PATH, 'utf-8'));
}

function bacaUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
}

function simpanUsers(data) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
}

function simpanData(data) {
  fs.writeFileSync(PRODUK_PATH, JSON.stringify(data, null, 2));
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(JSON.parse(body || '{}')));
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  let produk = bacaData();
  let users = bacaUsers();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  // ── PRODUK ──────────────────────────────────────

  if (method === 'GET' && url === '/api/produk') {
    return sendJSON(res, 200, { success: true, data: produk });
  }

  if (method === 'GET' && url === '/api/kategori') {
    const kategori = [...new Set(produk.map(p => p.kategori))];
    return sendJSON(res, 200, { success: true, data: kategori });
  }

  if (method === 'GET' && url.startsWith('/api/produk?kategori=')) {
    const kategori = url.split('=')[1];
    const filtered = produk.filter(p => p.kategori === kategori);
    if (filtered.length === 0) return sendJSON(res, 404, { success: false, message: `Kategori "${kategori}" tidak ditemukan` });
    return sendJSON(res, 200, { success: true, kategori, data: filtered });
  }

  const matchId = url.match(/^\/api\/produk\/(\d+)$/);

  if (method === 'GET' && matchId) {
    const item = produk.find(p => p.id === parseInt(matchId[1]));
    if (!item) return sendJSON(res, 404, { success: false, message: 'Produk tidak ditemukan' });
    return sendJSON(res, 200, { success: true, data: item });
  }

  if (method === 'POST' && url === '/api/produk') {
    const body = await getBody(req);
    const { nama, harga, stok, kategori, satuan } = body;
    if (!nama || !harga || !stok || !kategori) return sendJSON(res, 400, { success: false, message: 'nama, harga, stok, kategori wajib diisi' });
    const baru = { id: Date.now(), nama, harga, stok, kategori, satuan };
    produk.push(baru);
    simpanData(produk);
    return sendJSON(res, 201, { success: true, data: baru });
  }

  if (method === 'PUT' && matchId) {
    const index = produk.findIndex(p => p.id === parseInt(matchId[1]));
    if (index === -1) return sendJSON(res, 404, { success: false, message: 'Tidak ditemukan' });
    const body = await getBody(req);
    produk[index] = { ...produk[index], ...body };
    simpanData(produk);
    return sendJSON(res, 200, { success: true, data: produk[index] });
  }

  if (method === 'DELETE' && matchId) {
    produk = produk.filter(p => p.id !== parseInt(matchId[1]));
    simpanData(produk);
    return sendJSON(res, 200, { success: true, message: 'Produk dihapus' });
  }

  // ── AUTH ─────────────────────────────────────────

  if (method === 'POST' && url === '/api/register') {
    const body = await getBody(req);
    const { nama, email, password } = body;

    if (!nama || !email || !password) {
      return sendJSON(res, 400, { success: false, message: 'Semua kolom wajib diisi' });
    }

    const sudahAda = users.find(u => u.email === email);
    if (sudahAda) {
      return sendJSON(res, 400, { success: false, message: 'Email sudah terdaftar' });
    }

    const userBaru = { id: Date.now(), nama, email, password };
    users.push(userBaru);
    simpanUsers(users);
    return sendJSON(res, 201, { success: true, message: 'Registrasi berhasil' });
  }

  if (method === 'POST' && url === '/api/login') {
    const body = await getBody(req);
    const { email, password } = body;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return sendJSON(res, 401, { success: false, message: 'Email atau password salah' });
    }

    return sendJSON(res, 200, { success: true, data: user });
  }

  sendJSON(res, 404, { success: false, message: 'Endpoint tidak ditemukan' });
});

server.listen(3000, () => console.log('Server jalan di http://localhost:3000'));