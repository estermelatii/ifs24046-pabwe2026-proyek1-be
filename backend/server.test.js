process.env.DB_FILE = ':memory:';
const test = require('node:test');
const assert = require('node:assert');
const app = require('./server');

let server, base;
const post = (p, b) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
test.after(() => server.close());

test('daftar produk mendukung filter, sortir, dan pagination', async () => {
  const d = await (await fetch(`${base}/api/products?sort=price_asc&limit=5`)).json();
  assert.equal(d.items.length, 5);
  assert.equal(d.pages, Math.ceil(d.total / 5));
  assert.equal(d.total, 34);
  assert.ok(d.items[0].price <= d.items[1].price);
  const f = await (await fetch(`${base}/api/products?moment=2`)).json();
  assert.ok(f.items.every((p) => p.moment === 'Graduation'));
});
test('rekomendasi mengembalikan 3 buket', async () => {
  const d = await (await fetch(`${base}/api/recommend?moment=1&style=Cute&max=200000`)).json();
  assert.equal(d.items.length, 3);
  assert.ok(d.items[0].moment === 'Birthday' && d.items[0].style === 'Cute');
});
test('pesanan: total termasuk ongkir, kode berformat FG', async () => {
  const res = await post('/api/orders', { customer_name: 'Tes', phone: '0812', address: 'Balige', delivery_date: '2026-11-01', courier: 'JNE', items: [{ product_id: 1, quantity: 2, color: 'Pink' }] });
  const o = await res.json();
  assert.equal(res.status, 201);
  assert.equal(o.total, 385000);
  assert.match(o.code, /^FG\d{6}\d{4}$/);
});
test('register, login, dan riwayat pesanan', async () => {
  const r = await (await post('/api/auth/register', { name: 'Ani', email: 'ani@mail.com', password: 'rahasia1' })).json();
  const ord = await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + r.token },
    body: JSON.stringify({ customer_name: 'Ani', phone: '08', address: 'X', delivery_date: '2026-11-02', items: [{ product_id: 2, quantity: 1 }] }) });
  assert.equal(ord.status, 201);
  const mine = await (await fetch(base + '/api/my/orders', { headers: { Authorization: 'Bearer ' + r.token } })).json();
  assert.equal(mine.length, 1);
  assert.equal((await post('/api/auth/login', { email: 'ani@mail.com', password: 'salah' })).status, 400);
});
test('pesanan kosong ditolak', async () => assert.equal((await post('/api/orders', {})).status, 400));
