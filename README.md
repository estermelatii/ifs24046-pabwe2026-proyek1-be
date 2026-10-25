# FloraGift – Back-End (Express.js + SQLite)

REST API untuk aplikasi pemesanan bucket bunga FloraGift. Front-end ada di repository terpisah: `ifs24046-pabwe2026-proyek1`.

## Menjalankan di lokal
```bash
git clone https://github.com/estermelatii/ifs24046-pabwe2026-proyek1-be.git
cd ifs24046-pabwe2026-proyek1-be
npm install
npm start        # http://localhost:3000
npm test         # tes otomatis
```
Database SQLite (`floragift.db`) dibuat otomatis dan terisi 34 produk contoh saat pertama kali dijalankan.

## Endpoint utama
- `GET /api/products` (filter: moment, style, color, min, max, q, sort, page, limit), `GET /api/products/:id`, `GET /api/products/:id/reviews`
- `POST|PUT|DELETE /api/products`, `GET /api/categories`, `GET /api/recommend`
- `POST /api/orders`, `GET /api/orders/:code`, `GET /api/my/orders`, `PATCH /api/orders/:code/status`, `POST /api/orders/:code/received`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

## Deploy (Render)
Root Directory `./`, Build Command `npm install`, Start Command `npm start`.
