const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
export async function api(path, opt = {}) {
  let token = null;
  try { token = localStorage.getItem('fg-token'); } catch {}
  const res = await fetch(BASE + path, {
    method: opt.method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: opt.body ? JSON.stringify(opt.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}
