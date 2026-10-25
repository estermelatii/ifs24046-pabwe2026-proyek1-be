// Ilustrasi buket dibuat dengan SVG (tanpa foto) agar warna bisa mengikuti pilihan variasi.
const ACC = ['#fbf6ee', '#f6cf5c', '#ffffff', '#f4b6c4'];
export default function Bouquet({ color = '#f2a7bb', seed = 1 }) {
  let s = seed * 131 + 7;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const leaves = [...Array(7)].map((_, i) => <ellipse key={'l' + i} cx="100" cy="72" rx="9" ry="34" fill="#7fa385" opacity=".9" transform={`rotate(${-66 + i * 22} 100 138)`} />);
  const flowers = [...Array(9)].map((_, i) => {
    const x = 100 + (r() - 0.5) * 84, y = 58 + r() * 52, rad = 13 + r() * 8;
    const c = i % 4 === 3 ? ACC[(seed + i) % 4] : color;
    return <g key={'f' + i}><circle cx={x} cy={y} r={rad} fill={c} stroke="#0001" /><circle cx={x} cy={y} r={rad * 0.62} fill="#fff" opacity=".28" /><circle cx={x} cy={y} r={rad * 0.24} fill="#f6cf5c" /></g>;
  });
  const dots = [...Array(14)].map((_, i) => <circle key={'d' + i} cx={100 + (r() - 0.5) * 100} cy={46 + r() * 70} r="2.6" fill="#fff" />);
  return (
    <svg viewBox="0 0 200 240" role="img" aria-label="Ilustrasi buket bunga">
      {leaves}{dots}{flowers}
      <path d="M38 118 Q100 132 162 118 L112 222 Q100 230 88 222 Z" fill="#fffaf4" stroke="#ead9d6" />
      <path d="M100 134 L162 118 L112 222 Q100 228 100 224 Z" fill={color} opacity=".3" />
      <ellipse cx="86" cy="150" rx="17" ry="8" fill="#8a4a62" transform="rotate(-22 86 150)" />
      <ellipse cx="114" cy="150" rx="17" ry="8" fill="#8a4a62" transform="rotate(22 114 150)" />
      <circle cx="100" cy="151" r="6" fill="#6f3a4e" />
    </svg>
  );
}
const P = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8a3 3 0 016 0" /></>,
  home: <path d="M4 11l8-7 8 7v9H4z" />,
  shop: <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
  heart: <path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2 4.5 4.5 0 018 2c0 6-8 11-8 11z" />,
  trash: <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" />,
  truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></>,
  leaf: <path d="M5 19C5 9 11 5 20 4c0 9-4 15-12 15M5 19l8-8" />,
  gem: <path d="M6 4h12l3 5-9 11L3 9z" />,
};
export const Ic = ({ n }) => <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{P[n]}</svg>;
