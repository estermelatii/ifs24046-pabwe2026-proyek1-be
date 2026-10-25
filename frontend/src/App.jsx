import { useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useCart } from './cart.jsx';
import { Ic } from './Bouquet.jsx';
import { Home, Shop, Product, Find } from './pages.jsx';
import { Cart, Checkout, Success, Track, History, Account, About, Contact } from './pages2.jsx';

export default function App() {
  const { count } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const links = [['/', 'Home'], ['/toko', 'Shop'], ['/find', 'Find Your Bloom'], ['/about', 'About'], ['/kontak', 'Contact']];
  return (
    <>
      <header className="nav">
        <Link to="/" className="logo">FloraGift</Link>
        <nav className="menu">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'}>{l}</NavLink>)}</nav>
        <div className="icons">
          {open && (
            <form onSubmit={(e) => { e.preventDefault(); nav('/toko?q=' + encodeURIComponent(q)); setOpen(false); }}>
              <input autoFocus className="mini-search" placeholder="Cari buket" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
          )}
          <button aria-label="Cari" onClick={() => setOpen(!open)}><Ic n="search" /></button>
          <Link to="/akun" aria-label="Akun"><Ic n="user" /></Link>
          <Link to="/keranjang" aria-label="Keranjang" className="bag"><Ic n="bag" />{count > 0 && <b>{count}</b>}</Link>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/toko" element={<Shop />} />
          <Route path="/produk/:id" element={<Product />} />
          <Route path="/find" element={<Find />} />
          <Route path="/keranjang" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sukses/:code" element={<Success />} />
          <Route path="/lacak" element={<Track />} />
          <Route path="/lacak/:code" element={<Track />} />
          <Route path="/riwayat" element={<History />} />
          <Route path="/akun" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/kontak" element={<Contact />} />
        </Routes>
      </main>
      <footer className="foot">
        <div><div className="logo">FloraGift</div><p>Little flowers, meaningful moments.</p></div>
        <div><h4>Quick Links</h4><Link to="/">Home</Link><Link to="/toko">Shop</Link><Link to="/find">Find Your Bloom</Link><Link to="/about">About</Link></div>
        <div><h4>Customer Care</h4><Link to="/kontak">FAQ</Link><Link to="/kontak">Shipping</Link><Link to="/kontak">Returns</Link><Link to="/lacak">Track Order</Link></div>
        <div><h4>Follow Us</h4><div className="social"><a href="https://instagram.com" aria-label="Instagram">IG</a><a href="https://tiktok.com" aria-label="TikTok">TT</a><a href="https://wa.me/6281234567890" aria-label="WhatsApp">WA</a></div></div>
        <p className="copy">© 2026 FloraGift. All rights reserved.</p>
      </footer>
      <nav className="tabbar">
        <NavLink to="/" end><Ic n="home" />Home</NavLink>
        <NavLink to="/toko"><Ic n="shop" />Shop</NavLink>
        <NavLink to="/find"><Ic n="heart" />Find</NavLink>
        <NavLink to="/keranjang"><Ic n="bag" />Cart{count > 0 && <b>{count}</b>}</NavLink>
        <NavLink to="/akun"><Ic n="user" />Profile</NavLink>
      </nav>
    </>
  );
}
