import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, rupiah } from './api.js';
import { useCart } from './cart.jsx';
import Bouquet, { Ic } from './Bouquet.jsx';

export function useFetch(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { setData(null); setError(''); api(path).then(setData).catch((e) => setError(e.message)); }, [path]);
  return [data, error];
}
export const Status = ({ data, error, children }) =>
  error ? <p className="notice">{error}. Pastikan API berjalan lalu muat ulang halaman.</p> : !data ? <p className="notice">Memuat…</p> : children;
export const Stars = ({ v }) => <span className="stars" aria-label={`Rating ${v}`}>{'★'.repeat(Math.round(v))}{'☆'.repeat(5 - Math.round(v))}</span>;
export function Pic({ hex, seed, big, src }) {
  const [bad, setBad] = useState(false);
  const photo = src && !bad;
  return (
    <div className={'pic' + (big ? ' big' : '') + (photo ? ' photo' : '')} style={{ background: `radial-gradient(circle at 50% 35%, ${hex}55, #3a0509 78%)` }}>
      {photo ? <img src={src} alt="" loading="lazy" onError={() => setBad(true)} /> : <Bouquet color={hex} seed={seed} />}
    </div>
  );
}
export function Card({ p }) {
  return (
    <Link to={`/produk/${p.id}`} className="card">
      <Pic hex={p.colors[0].hex} seed={p.id} src={`/foto/${p.id}-1.jpg`} />
      <h3>{p.name}</h3>
      <p className="muted small">{p.moment} · {p.style}</p>
      <p className="price">{rupiah(p.price)}</p>
    </Link>
  );
}
const MI = { Birthday: '🎂', Graduation: '🎓', Anniversary: '💞', Appreciation: '🎁', 'Just Because': '🌷' };

export function Home() {
  const [d, err] = useFetch('/api/products?sort=popular&limit=4');
  const [cats] = useFetch('/api/categories');
  const steps = [['Pilih Buket', 'Jelajahi katalog kami'], ['Checkout', 'Isi data pengiriman'], ['Kami Siapkan', 'Dirangkai dengan penuh cinta'], ['Sampai di Tujuan', 'Buket siap diterima']];
  const colls = [['The Rose Edit', 'Romantis dan abadi', '/toko?color=Red', 4], ['Blanc Pure', 'Anggun dan bersih', '/toko?color=White', 15], ['Sunlit', 'Hangat dan ceria', '/toko?color=Yellow', 16]];
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="hero-copy">
            <span className="eyebrow">FloraGift · Floral Atelier</span>
            <h1>Little flowers,<br /><em>meaningful</em> moments.</h1>
            <p>Buket cantik untuk setiap cerita spesialmu. Pilih bunga, warna, dan pesan kartumu sendiri, kami rangkai dengan tangan dan antar sampai tujuan.</p>
            <div className="row"><Link className="btn lg" to="/toko">Explore Bouquets</Link><Link className="btn ghost lg" to="/find">Find Your Bloom</Link></div>
          </div>
        </div>
        <div className="hero-right"><img src="/foto/7-1.jpg" alt="Buket bunga putih" /></div>
      </section>
      <section className="philo">
        <div>
          <span className="eyebrow">Philosophy</span>
          <h2>Flowers as<br />Emotion</h2>
          <Link to="/about" className="btn ghost">Discover our story →</Link>
        </div>
        <div>
          <blockquote>Setiap buket dirancang agar dikenang lama setelah momennya berlalu.</blockquote>
          <p className="muted">Terinspirasi dari seni florist yang abadi, FloraGift merangkai buket dengan tangan, dari bunga segar pilihan, supaya setiap hadiah terasa personal dan berkesan.</p>
        </div>
      </section>
      <div className="marquee" aria-hidden="true"><div>{[...Array(12)].map((_, i) => <span key={i}>{i % 2 ? 'Flower Atelier' : 'FloraGift'}</span>)}</div></div>
      <section className="wrap">
        <span className="eyebrow">Collections</span>
        <h2>Bouquets that Stay with You</h2>
        <div className="coll">{colls.map(([n, t, to, id]) => <Link key={n} to={to} className="coll-card"><img src={`/foto/${id}-1.jpg`} alt="" loading="lazy" /><div><small>Collection</small><h3>{n}</h3><span>{t}</span></div></Link>)}</div>
      </section>
      <section className="wrap">
        <div className="between"><h2>Our Featured Bouquets</h2><Link to="/toko">View All →</Link></div>
        <Status data={d} error={err}><div className="grid">{d?.items.map((p) => <Card key={p.id} p={p} />)}</div></Status>
      </section>
      <section className="wrap">
        <h2>Shop by Moment</h2>
        <div className="moments">{cats?.map((c) => <Link key={c.id} to={`/toko?moment=${c.id}`}><span>{MI[c.name]}</span>{c.name}</Link>)}</div>
      </section>
      <section className="signature">
        <div><span className="eyebrow">Signature Bouquets</span><h2>The Bouquet Edit</h2><Link to="/toko" className="btn ghost lg">Shop now →</Link></div>
      </section>
      <section className="wrap">
        <h2>How It Works</h2>
        <ol className="steps">{steps.map(([t, s], i) => <li key={t}><i>{i + 1}</i><b>{t}</b><span>{s}</span></li>)}</ol>
      </section>
    </>
  );
}

const RANGES = [['Di bawah Rp150.000', 0, 149999], ['Rp150.000 – Rp200.000', 150000, 200000], ['Rp200.000 – Rp250.000', 200001, 250000], ['Di atas Rp250.000', 250001, 999999]];
const COLORS = { Pink: '#f2a7bb', Yellow: '#f6cf5c', Purple: '#b9a0d8', Orange: '#f08a3c', Blue: '#9db9e0', White: '#fbf6ee', Red: '#d85a6a' };

export function Shop() {
  const [sp, setSp] = useSearchParams();
  const g = (k) => sp.get(k) || '';
  const upd = (k, v) => { const n = new URLSearchParams(sp); g(k) === String(v) ? n.delete(k) : n.set(k, v); n.delete('page'); setSp(n); };
  const range = (min, max) => { const n = new URLSearchParams(sp); n.delete('page'); if (g('min') === String(min)) { n.delete('min'); n.delete('max'); } else { n.set('min', min); n.set('max', max); } setSp(n); };
  const go = (page) => { const n = new URLSearchParams(sp); n.set('page', page); setSp(n); window.scrollTo(0, 0); };
  const [cats] = useFetch('/api/categories');
  const [d, err] = useFetch('/api/products?' + sp.toString());
  const Chk = ({ on, onClick, children }) => <label className="chk"><input type="checkbox" checked={on} onChange={onClick} />{children}</label>;
  return (
    <section className="wrap">
      <h1 className="page-title">Shop Our Bouquets</h1>
      <p className="muted">Temukan buket mini yang sesuai dengan momenmu.{g('q') && ` Hasil untuk “${g('q')}”.`}</p>
      <div className="shop">
        <aside className="filters">
          <h4>Harga</h4>{RANGES.map(([l, a, b]) => <Chk key={l} on={g('min') === String(a)} onClick={() => range(a, b)}>{l}</Chk>)}
          <h4>Warna</h4><div className="swatches">{Object.entries(COLORS).map(([n, h]) => <button key={n} title={n} aria-label={n} aria-pressed={g('color') === n} className={g('color') === n ? 'on' : ''} style={{ background: h }} onClick={() => upd('color', n)} />)}</div>
          <h4>Gaya</h4>{['Cute', 'Soft', 'Elegant', 'Cheerful'].map((s) => <Chk key={s} on={g('style') === s} onClick={() => upd('style', s)}>{s}</Chk>)}
          <h4>Momen</h4>{cats?.map((c) => <Chk key={c.id} on={g('moment') === String(c.id)} onClick={() => upd('moment', c.id)}>{c.name}</Chk>)}
          {sp.toString() && <button className="link" onClick={() => setSp({})}>Hapus semua filter</button>}
        </aside>
        <div>
          <div className="between toolbar">
            <span className="muted">{d ? `${d.total} buket` : ''}</span>
            <label>Urutkan: <select value={g('sort') || 'popular'} onChange={(e) => { const n = new URLSearchParams(sp); n.set('sort', e.target.value); n.delete('page'); setSp(n); }}>
              <option value="popular">Terpopuler</option><option value="newest">Terbaru</option><option value="price_asc">Harga terendah</option><option value="price_desc">Harga tertinggi</option>
            </select></label>
          </div>
          <Status data={d} error={err}>
            {d?.items.length ? <div className="grid three">{d.items.map((p) => <Card key={p.id} p={p} />)}</div> : <p className="notice">Tidak ada buket yang cocok. Coba ubah atau hapus filter.</p>}
            {d?.pages > 1 && <div className="pager">{[...Array(d.pages)].map((_, i) => <button key={i} className={d.page === i + 1 ? 'on' : ''} onClick={() => go(i + 1)}>{i + 1}</button>)}</div>}
          </Status>
        </div>
      </div>
    </section>
  );
}

export function Product() {
  const { id } = useParams();
  const [p, err] = useFetch('/api/products/' + id);
  const [rev] = useFetch(`/api/products/${id}/reviews`);
  const { add } = useCart();
  const nav = useNavigate();
  const [qty, setQty] = useState(1), [ci, setCi] = useState(0), [gi, setGi] = useState(0), [tab, setTab] = useState('d');
  return (
    <section className="wrap">
      <Status data={p} error={err}>
        {p && (() => { const c = p.colors[ci], seeds = [p.id, p.id + 11, p.id + 23].slice(0, p.photos || 1); return (
          <>
            <p className="crumb"><Link to="/">Home</Link> / <Link to="/toko">Shop</Link> / {p.name}</p>
            <div className="detail">
              <div className="gallery" style={seeds.length > 1 ? undefined : { gridTemplateColumns: '1fr' }}>
                {seeds.length > 1 && <div className="thumbs">{seeds.map((s, i) => <button key={s} aria-label={`Foto ${i + 1}`} className={gi === i ? 'on' : ''} onClick={() => setGi(i)}><Pic hex={c.hex} seed={s} src={`/foto/${p.id}-${i + 1}.jpg`} /></button>)}</div>}
                <Pic hex={c.hex} seed={seeds[gi]} src={`/foto/${p.id}-${gi + 1}.jpg`} big />
              </div>
              <div>
                <h1 className="page-title">{p.name}</h1>
                <p className="price big">{rupiah(p.price)} <span className={'badge' + (p.stock < 1 ? ' out' : '')}>{p.stock > 0 ? 'Stok Tersedia' : 'Stok Habis'}</span></p>
                <p><Stars v={p.rating} /> <span className="muted small">{p.rating} ({p.reviews_count} ulasan)</span></p>
                <p className="desc">{p.description}</p>
                <p className="muted small">Pilih warna: <b>{c.name}</b></p>
                <div className="swatches">{p.colors.map((x, i) => <button key={x.name} aria-label={x.name} aria-pressed={ci === i} className={ci === i ? 'on' : ''} style={{ background: x.hex }} onClick={() => setCi(i)} />)}</div>
                <div className="row buy">
                  <div className="qty"><button aria-label="Kurangi" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button aria-label="Tambah" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button></div>
                  <button className="btn" disabled={p.stock < 1} onClick={() => { add(p, qty, c); nav('/keranjang'); }}>Tambah ke Keranjang</button>
                </div>
              </div>
            </div>
            <div className="assure">
              <div><Ic n="truck" /><b>Pengiriman</b><span>Tersedia di seluruh Indonesia</span></div>
              <div><Ic n="leaf" /><b>Garansi Kesegaran</b><span>Bunga segar, diganti jika layu dalam 3 hari</span></div>
              <div><Ic n="gem" /><b>Kualitas Terjamin</b><span>Dirangkai handmade dari bunga pilihan</span></div>
            </div>
            <div className="tabs">{[['d', 'Deskripsi'], ['i', 'Informasi Produk'], ['u', 'Ulasan']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
            {tab === 'd' && <p className="desc">{p.description} Setiap buket dibuat secara handmade sehingga memiliki sentuhan unik dan khusus. Tambahkan pesan kartu ucapan saat checkout.</p>}
            {tab === 'i' && <dl className="info"><dt>Momen</dt><dd>{p.moment}</dd><dt>Gaya</dt><dd>{p.style}</dd><dt>Warna</dt><dd>{p.colors.map((x) => x.name).join(', ')}</dd><dt>Stok</dt><dd>{p.stock}</dd></dl>}
            {tab === 'u' && (rev?.map((r) => <div key={r.id} className="rev"><b>{r.name}</b> <Stars v={r.rating} /><p>{r.comment}</p></div>) || <p className="notice">Memuat…</p>)}
          </>); })()}
      </Status>
    </section>
  );
}

export function Find() {
  const [cats] = useFetch('/api/categories');
  const Q = [
    { k: 'moment', t: 'Untuk momen apa buket ini dibeli?', o: (cats || []).map((c) => ({ v: c.id, l: c.name, e: MI[c.name] })) },
    { k: 'style', t: 'Gaya buket seperti apa yang kamu suka?', o: ['Cute', 'Soft', 'Elegant', 'Cheerful'].map((x) => ({ v: x, l: x })) },
    { k: 'max', t: 'Berapa budgetmu?', o: [[150000, 'Maks. Rp150.000'], [200000, 'Maks. Rp200.000'], [300000, 'Maks. Rp300.000']].map(([v, l]) => ({ v, l })) },
  ];
  const [step, setStep] = useState(0), [ans, setAns] = useState({}), [res, setRes] = useState(null), [err, setErr] = useState('');
  const q = Q[step];
  const next = async () => {
    if (step < Q.length - 1) return setStep(step + 1);
    try { setRes((await api('/api/recommend?' + new URLSearchParams(ans))).items); } catch (e) { setErr(e.message); }
  };
  if (res) return (
    <section className="wrap">
      <h1 className="page-title">Rekomendasi untukmu</h1><p className="muted">Buket yang paling cocok dengan jawabanmu.</p>
      <div className="grid">{res.map((p) => <Card key={p.id} p={p} />)}</div>
      <button className="btn ghost" onClick={() => { setRes(null); setStep(0); setAns({}); }}>Ulangi kuis</button>
    </section>
  );
  return (
    <section className="wrap narrow">
      <h1 className="page-title">Find Your Bloom</h1>
      <p className="muted">Jawab beberapa pertanyaan singkat untuk mendapatkan rekomendasi buket yang paling cocok.</p>
      <div className="box quiz">
        <div className="progress"><i style={{ width: `${((step + 1) / Q.length) * 100}%` }} /></div>
        <p className="muted small">Pertanyaan {step + 1} dari {Q.length}</p>
        <h3>{q.t}</h3>
        <div className="opts">{q.o.map((o) => <button key={o.v} className={String(ans[q.k]) === String(o.v) ? 'on' : ''} onClick={() => setAns({ ...ans, [q.k]: o.v })}>{o.e && <span>{o.e}</span>}{o.l}</button>)}</div>
        {err && <p className="error">{err}</p>}
        <div className="between">
          <button className="link" disabled={!step} onClick={() => setStep(step - 1)}>Kembali</button>
          <button className="btn" disabled={ans[q.k] === undefined} onClick={next}>{step < Q.length - 1 ? 'Selanjutnya →' : 'Lihat rekomendasi'}</button>
        </div>
      </div>
    </section>
  );
}
