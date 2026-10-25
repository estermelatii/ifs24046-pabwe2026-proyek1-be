import { createContext, useContext, useEffect, useState } from 'react';
const Ctx = createContext();
export const useCart = () => useContext(Ctx);
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('fg-cart2')) || []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('fg-cart2', JSON.stringify(items)); } catch {} }, [items]);
  const add = (p, qty = 1, color = p.colors?.[0]) => setItems((cur) => {
    const key = `${p.id}|${color.name}`;
    return cur.find((i) => i.key === key) ? cur.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      : [...cur, { key, id: p.id, name: p.name, price: p.price, color, qty }];
  });
  const setQty = (key, qty) => setItems((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  const remove = (key) => setItems((c) => c.filter((i) => i.key !== key));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>{children}</Ctx.Provider>;
}
