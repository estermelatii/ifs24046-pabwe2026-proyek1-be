const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_FILE || 'floragift.db');
db.pragma('foreign_keys = ON');
// Migrasi: skema lama (versi 1) dibuang otomatis
const old = db.prepare("SELECT name FROM pragma_table_info('products')").all();
if (old.length && !old.some((c) => c.name === 'photos'))
  db.exec(`PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS order_items; DROP TABLE IF EXISTS orders; DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS products; DROP TABLE IF EXISTS categories;
    PRAGMA foreign_keys = ON;`);

db.exec(`
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT, price INTEGER NOT NULL,
  stock INTEGER DEFAULT 20, photos INTEGER DEFAULT 1, style TEXT, colors TEXT, sold INTEGER DEFAULT 0, rating REAL DEFAULT 4.5, reviews_count INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id));
CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY, product_id INTEGER REFERENCES products(id), name TEXT, rating INTEGER, comment TEXT);
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id));
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, code TEXT UNIQUE, user_id INTEGER, customer_name TEXT, phone TEXT, email TEXT,
  address TEXT, city TEXT, courier TEXT, shipping_cost INTEGER, delivery_date TEXT, card_message TEXT, payment_method TEXT,
  total INTEGER, status TEXT DEFAULT 'Pesanan Dibuat', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(id), product_id INTEGER,
  name TEXT, color TEXT, color_hex TEXT, quantity INTEGER, price INTEGER);
`);

const CMAP = { Pink: '#f2a7bb', Yellow: '#f6cf5c', Purple: '#b9a0d8', Orange: '#f08a3c', Blue: '#9db9e0', White: '#fbf6ee', Red: '#d85a6a' };
const ID = { Pink: 'pink', Yellow: 'kuning', Purple: 'ungu', Orange: 'oranye', Blue: 'biru', White: 'putih', Red: 'merah' };
if (db.prepare('SELECT COUNT(*) c FROM categories').get().c === 0) {
  ['Birthday', 'Graduation', 'Anniversary', 'Appreciation', 'Just Because'].forEach((c) => db.prepare('INSERT INTO categories(name) VALUES(?)').run(c));
  const ip = db.prepare('INSERT INTO products(name,description,price,style,colors,sold,rating,reviews_count,category_id) VALUES(?,?,?,?,?,?,?,?,?)');
  const ir = db.prepare('INSERT INTO reviews(product_id,name,rating,comment) VALUES(?,?,?,?)');
  const who = ['Salsa', 'Rina', 'Dimas', 'Maya', 'Putri'];
  const say = ['Bunganya segar dan rangkaiannya rapi sekali.', 'Penerimanya senang, pengiriman tepat waktu.', 'Cantik, sesuai foto. Pasti pesan lagi.'];
  [
    ["Lilac Reverie", 185000, "Elegant", ["Purple"], 1],
    ["Midnight Sunflower", 225000, "Elegant", ["Blue", "Yellow"], 2],
    ["Crimson Tower", 325000, "Elegant", ["Red"], 3],
    ["Classic Red Rose", 245000, "Elegant", ["Red"], 3],
    ["Wild Fiesta", 195000, "Cheerful", ["Pink", "Yellow"], 1],
    ["Garden Party", 175000, "Cute", ["Pink"], 1],
    ["White Orchid Whisper", 265000, "Elegant", ["White"], 3],
    ["Golden Meadow", 165000, "Cheerful", ["Yellow", "Orange"], 4],
    ["Blue Birthday Bloom", 285000, "Soft", ["Blue"], 1],
    ["Pure Lily", 235000, "Elegant", ["White"], 4],
    ["Sky Cloud", 215000, "Soft", ["Blue", "White"], 5],
    ["Rose Promise", 195000, "Soft", ["Red"], 3],
    ["Cotton Gerbera", 125000, "Soft", ["White"], 5],
    ["Apricot Ranunculus", 155000, "Cute", ["Orange"], 5],
    ["Ivory Garden", 175000, "Elegant", ["White"], 2],
    ["Sunshine Smile", 185000, "Cheerful", ["Yellow"], 2],
    ["Ocean Hydrangea", 255000, "Elegant", ["Blue"], 3],
    ["Daisy Cream", 145000, "Soft", ["White"], 5],
    ["Orange Dahlia Dream", 205000, "Cheerful", ["Orange"], 1],
    ["Terracotta Bloom", 245000, "Cheerful", ["Orange"], 4],
    ["Lilac Sunshine", 165000, "Cute", ["Purple", "Yellow"], 1],
    ["Blue Delphinium", 235000, "Elegant", ["Blue"], 2],
    ["Noir Roses", 295000, "Elegant", ["Red"], 3],
    ["Butter Rose", 155000, "Soft", ["Yellow"], 4],
    ["Scarlet Velvet", 275000, "Elegant", ["Red"], 3],
    ["Honey Sunflower", 175000, "Cheerful", ["Yellow"], 2],
    ["Violet Lisianthus", 215000, "Elegant", ["Purple"], 4],
    ["Peachy Kraft", 135000, "Cute", ["Orange"], 5],
    ["Lavender Rose", 265000, "Soft", ["Purple"], 1],
    ["Lemon Spring", 145000, "Soft", ["White", "Yellow"], 5],
    ["Orange Hydrangea", 225000, "Cheerful", ["Orange"], 4],
    ["Rosy Lily", 195000, "Soft", ["Pink"], 1],
    ["Yellow Orchid Joy", 175000, "Cheerful", ["Yellow"], 2],
    ["Pink Lily Bundle", 185000, "Cute", ["Pink"], 1],
  ].forEach(([n, pr, st, cs, cat], i) => {
    const r = ip.run(n, `Buket bergaya ${st.toLowerCase()} dalam nuansa ${cs.map((c) => ID[c]).join(' dan ')}. Dirangkai handmade dari bunga segar pilihan.`,
      pr, st, JSON.stringify(cs.map((name) => ({ name, hex: CMAP[name] }))), 140 - i * 3, +(4.5 + ((i * 7) % 5) / 10).toFixed(1), 20 + ((i * 13) % 90), cat);
    for (let k = 0; k < 3; k++) ir.run(r.lastInsertRowid, who[(i + k) % 5], 5 - (k === 2 ? 1 : 0), say[k]);
  });
}

const COURIERS = { JNE: 15000, JNT: 18000, GoSend: 25000 };
const STATUSES = ['Pesanan Dibuat', 'Sedang Diproses', 'Sedang Dikirim', 'Selesai'];
const hash = (pw, salt = crypto.randomBytes(8).toString('hex')) => salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  req.user = t ? db.prepare('SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?').get(t) : null;
  next();
});

const baseQ = 'SELECT p.*, c.name AS moment FROM products p LEFT JOIN categories c ON c.id = p.category_id';
const parse = (p) => p && { ...p, colors: JSON.parse(p.colors) };
const withItems = (o) => o && { ...o, items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) };

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/categories', (_, res) => res.json(db.prepare('SELECT * FROM categories').all()));

// --- Auth ---
const session = (u, res, status = 200) => {
  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions(token,user_id) VALUES(?,?)').run(token, u.id);
  res.status(status).json({ token, user: { id: u.id, name: u.name, email: u.email } });
};
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ error: 'Nama, email, dan password (min. 6 karakter) wajib diisi' });
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
  const r = db.prepare('INSERT INTO users(name,email,password) VALUES(?,?,?)').run(name, email, hash(password));
  session({ id: r.lastInsertRowid, name, email }, res, 201);
});
app.post('/api/auth/login', (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(req.body.email || '');
  if (!u || hash(req.body.password || '', u.password.split(':')[0]) !== u.password) return res.status(400).json({ error: 'Email atau password salah' });
  session(u, res);
});
app.get('/api/auth/me', (req, res) => (req.user ? res.json(req.user) : res.status(401).json({ error: 'Belum masuk' })));

// --- Produk ---
app.get('/api/products', (req, res) => {
  const { moment, style, color, min, max, q, sort } = req.query;
  const page = Math.max(1, +req.query.page || 1), limit = Math.min(24, +req.query.limit || 12);
  let w = ' WHERE 1=1'; const a = [];
  if (moment) { w += ' AND p.category_id=?'; a.push(moment); }
  if (style) { w += ' AND p.style=?'; a.push(style); }
  if (color) { w += ' AND p.colors LIKE ?'; a.push(`%"name":"${color.replace(/[^A-Za-z]/g, '')}"%`); }
  if (min) { w += ' AND p.price>=?'; a.push(min); }
  if (max) { w += ' AND p.price<=?'; a.push(max); }
  if (q) { w += ' AND p.name LIKE ?'; a.push(`%${q}%`); }
  const order = { popular: 'p.sold DESC', price_asc: 'p.price ASC', price_desc: 'p.price DESC', newest: 'p.id DESC' }[sort] || 'p.sold DESC';
  const total = db.prepare('SELECT COUNT(*) c FROM products p' + w).get(...a).c;
  const items = db.prepare(`${baseQ}${w} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...a, limit, (page - 1) * limit).map(parse);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
app.get('/api/recommend', (req, res) => {
  const { moment, style, max } = req.query;
  const items = db.prepare(baseQ).all().map(parse)
    .map((p) => ({ ...p, score: (String(p.category_id) === moment ? 3 : 0) + (p.style === style ? 2 : 0) + (!max || p.price <= +max ? 1 : 0) }))
    .sort((x, y) => y.score - x.score || y.sold - x.sold).slice(0, 3);
  res.json({ items });
});
app.get('/api/products/:id', (req, res) => {
  const p = parse(db.prepare(baseQ + ' WHERE p.id = ?').get(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: 'Produk tidak ditemukan' });
});
app.get('/api/products/:id/reviews', (req, res) => res.json(db.prepare('SELECT * FROM reviews WHERE product_id=?').all(req.params.id)));
app.post('/api/products', (req, res) => {
  const b = req.body;
  if (!b.name || !b.price) return res.status(400).json({ error: 'Nama dan harga wajib diisi' });
  const r = db.prepare('INSERT INTO products(name,description,price,stock,style,colors,category_id) VALUES(?,?,?,?,?,?,?)')
    .run(b.name, b.description || '', b.price, b.stock ?? 20, b.style || 'Cute', JSON.stringify(b.colors || [{ name: 'Pink', hex: CMAP.Pink }]), b.category_id || null);
  res.status(201).json(parse(db.prepare(baseQ + ' WHERE p.id = ?').get(r.lastInsertRowid)));
});
app.put('/api/products/:id', (req, res) => {
  const o = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  const n = { ...o, ...req.body, colors: JSON.stringify(req.body.colors || JSON.parse(o.colors)) };
  db.prepare('UPDATE products SET name=?,description=?,price=?,stock=?,style=?,colors=?,category_id=? WHERE id=?')
    .run(n.name, n.description, n.price, n.stock, n.style, n.colors, n.category_id, o.id);
  res.json(parse(db.prepare(baseQ + ' WHERE p.id = ?').get(o.id)));
});
app.delete('/api/products/:id', (req, res) => {
  try {
    const r = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    r.changes ? res.json({ deleted: true }) : res.status(404).json({ error: 'Produk tidak ditemukan' });
  } catch { res.status(400).json({ error: 'Produk tidak bisa dihapus' }); }
});

// --- Pesanan ---
const createOrder = db.transaction((b, userId) => {
  let sub = 0;
  const lines = b.items.map((it) => {
    const p = parse(db.prepare('SELECT * FROM products WHERE id = ?').get(it.product_id));
    const qty = Number(it.quantity);
    if (!p || !(qty > 0)) throw new Error('Item pesanan tidak valid');
    if (p.stock < qty) throw new Error(`Stok ${p.name} tidak cukup`);
    const c = p.colors.find((x) => x.name === it.color) || p.colors[0];
    sub += p.price * qty;
    return { p, qty, c };
  });
  const ship = COURIERS[b.courier] ?? COURIERS.JNE;
  const r = db.prepare(`INSERT INTO orders(code,user_id,customer_name,phone,email,address,city,courier,shipping_cost,delivery_date,card_message,payment_method,total)
    VALUES('tmp',?,?,?,?,?,?,?,?,?,?,?,?)`).run(userId, b.customer_name, b.phone, b.email || '', b.address, b.city || '', b.courier || 'JNE', ship,
    b.delivery_date, b.card_message || '', b.payment_method || 'Transfer Bank', sub + ship);
  const d = new Date();
  const code = `FG${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(r.lastInsertRowid).padStart(4, '0')}`;
  db.prepare('UPDATE orders SET code=? WHERE id=?').run(code, r.lastInsertRowid);
  lines.forEach(({ p, qty, c }) => {
    db.prepare('INSERT INTO order_items(order_id,product_id,name,color,color_hex,quantity,price) VALUES(?,?,?,?,?,?,?)')
      .run(r.lastInsertRowid, p.id, p.name, c.name, c.hex, qty, p.price);
    db.prepare('UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?').run(qty, qty, p.id);
  });
  return code;
});
app.post('/api/orders', (req, res) => {
  const b = req.body;
  if (!b.customer_name || !b.phone || !b.address || !b.delivery_date || !Array.isArray(b.items) || !b.items.length)
    return res.status(400).json({ error: 'Data pesanan belum lengkap' });
  try { res.status(201).json(withItems(db.prepare('SELECT * FROM orders WHERE code = ?').get(createOrder(b, req.user?.id ?? null)))); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.get('/api/orders', (_, res) => res.json(db.prepare('SELECT * FROM orders ORDER BY id DESC').all().map(withItems)));
app.get('/api/my/orders', (req, res) => req.user
  ? res.json(db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC').all(req.user.id).map(withItems))
  : res.status(401).json({ error: 'Silakan masuk dulu' }));
app.get('/api/orders/:code', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(req.params.code.toUpperCase());
  o ? res.json(withItems(o)) : res.status(404).json({ error: 'Kode pesanan tidak ditemukan' });
});
app.patch('/api/orders/:code/status', (req, res) => {
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Status tidak valid' });
  const r = db.prepare('UPDATE orders SET status = ? WHERE code = ?').run(req.body.status, req.params.code);
  r.changes ? res.json({ code: req.params.code, status: req.body.status }) : res.status(404).json({ error: 'Pesanan tidak ditemukan' });
});
app.post('/api/orders/:code/received', (req, res) => {
  const r = db.prepare("UPDATE orders SET status='Selesai' WHERE code=? AND status='Sedang Dikirim'").run(req.params.code);
  r.changes ? res.json({ status: 'Selesai' }) : res.status(400).json({ error: 'Pesanan belum dalam pengiriman' });
});

module.exports = app;
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`FloraGift API berjalan di http://localhost:${port}`));
}
