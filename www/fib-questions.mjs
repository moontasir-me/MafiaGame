/* Fibonacci: short maths questions, made fresh every time, in four levels.
   Level 1 suits ages 9–12, level 2 school years 7–10, level 3 college (HSC), level 4 a STEM undergraduate.
   Every question has one right answer and three near misses; `why` is a one-line working. */

export const LEVELS = [
  { id: 1, name: 'অঙ্কুর', age: '৯–১২ বছর', note: 'যোগ-বিয়োগ, নামতা, ভাগ, সহজ ভগ্নাংশ', seconds: 25 },
  { id: 2, name: 'পাতা', age: 'স্কুল · ৭ম–১০ম', note: 'শতকরা, বর্গমূল, ল.সা.গু, সমীকরণ', seconds: 35 },
  { id: 3, name: 'শাখা', age: 'কলেজ · একাদশ–দ্বাদশ', note: 'লগ, ত্রিকোণমিতি, বিন্যাস, অন্তরীকরণ', seconds: 45 },
  { id: 4, name: 'মহীরুহ', age: 'স্নাতক · STEM', note: 'ক্যালকুলাস, ম্যাট্রিক্স, সম্ভাবনা, বাইনারি', seconds: 60 }
];

const int = (lo, hi, r = Math.random) => lo + Math.floor(r() * (hi - lo + 1));
const pick = (list, r = Math.random) => list[Math.floor(r() * list.length)];
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const frac = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? String(n) : `${n}/${d}`; };
const nCr = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
const sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] ?? (c === '-' ? '⁻' : c)).join('');

/* Three wrong answers near a number answer. */
function near(ans, r, extra = []) {
  const out = new Set(), a = Number(ans), step = Math.max(1, Math.round(Math.abs(a) * .1));
  for (const e of extra) if (String(e) !== String(ans)) out.add(String(e));
  const tries = [a + step, a - step, a + 1, a - 1, a + 2 * step, a * 2, a + 10, a - 10, Math.round(a / 2)];
  for (const t of tries.sort(() => r() - .5)) { if (out.size >= 3) break; if (t !== a && Number.isFinite(t)) out.add(String(t)); }
  return [...out].slice(0, 3);
}
const q = (text, answer, wrong, why) => ({ q: text, a: String(answer), wrong: wrong.map(String), why });

const L1 = [
  r => { const a = int(120, 899, r), b = int(45, 499, r); return q(`${a} + ${b} = ?`, a + b, near(a + b, r, [a + b + 100, a + b - 10]), `${a} আর ${b} যোগ করলে ${a + b}।`); },
  r => { const a = int(300, 999, r), b = int(45, 299, r); return q(`${a} − ${b} = ?`, a - b, near(a - b, r, [a - b + 10, a + b]), `${a} থেকে ${b} বাদ দিলে ${a - b}।`); },
  r => { const a = int(3, 12, r), b = int(4, 12, r); return q(`${a} × ${b} = ?`, a * b, near(a * b, r, [a * (b + 1), (a + 1) * b]), `${a}-এর নামতায় ${b} ঘর: ${a * b}।`); },
  r => { const b = int(3, 9, r), c = int(4, 12, r); return q(`${b * c} ÷ ${b} = ?`, c, near(c, r, [c + 1, b]), `${b} × ${c} = ${b * c}, তাই ভাগফল ${c}।`); },
  r => { const d = pick([2, 3, 4, 5], r), n = d * int(3, 12, r); return q(`${n}-এর ১/${d} অংশ কত?`, n / d, near(n / d, r, [n * d, n - d]), `${n} ÷ ${d} = ${n / d}।`); },
  r => { const s = int(2, 9, r), d = int(3, 8, r), list = [0, 1, 2, 3].map(i => s + i * d); return q(`পরের সংখ্যা কোনটি? ${list.join(', ')}, …`, s + 4 * d, near(s + 4 * d, r, [s + 3 * d + d + 1, s + 5 * d]), `প্রতিবার ${d} করে বাড়ছে।`); },
  r => { const a = int(6, 40, r), x = int(5, 40, r); return q(`${a} + ? = ${a + x}`, x, near(x, r, [a + x, x + 1]), `${a + x} − ${a} = ${x}।`); },
  r => { const p = int(8, 25, r), n = int(3, 9, r); return q(`একটা কলমের দাম ${p} টাকা। ${n}টা কলমের দাম কত টাকা?`, p * n, near(p * n, r, [p + n, p * (n - 1)]), `${p} × ${n} = ${p * n} টাকা।`); },
  r => { const h = int(2, 6, r); return q(`${h} ঘণ্টায় কত মিনিট?`, h * 60, near(h * 60, r, [h * 100, h * 30]), `১ ঘণ্টা = ৬০ মিনিট, তাই ${h} × ৬০ = ${h * 60}।`); },
  r => { const k = int(4, 9, r), f = [1, 1]; while (f.length < k + 1) f.push(f.at(-1) + f.at(-2)); return q(`ফিবোনাচি সারি: ${f.slice(0, k).join(', ')}, … পরেরটা কত?`, f[k], near(f[k], r, [f[k - 1] * 2, f[k] + 1]), `আগের দুটো যোগ: ${f[k - 2]} + ${f[k - 1]} = ${f[k]}।`); },
  r => { const a = int(2, 9, r), b = int(2, 9, r), c = int(2, 9, r); return q(`${a} + ${b} × ${c} = ?`, a + b * c, near(a + b * c, r, [(a + b) * c]), `আগে গুণ: ${b} × ${c} = ${b * c}, তারপর ${a} যোগ।`); },
  r => { const l = int(3, 12, r), w = int(2, 9, r); return q(`একটা আয়তের দৈর্ঘ্য ${l} সেমি, প্রস্থ ${w} সেমি। পরিসীমা কত সেমি?`, 2 * (l + w), near(2 * (l + w), r, [l * w, l + w]), `পরিসীমা = ২ × (${l} + ${w}) = ${2 * (l + w)}।`); }
];

const L2 = [
  r => { const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 75], r), n = pick([40, 60, 80, 120, 200, 240, 360, 400], r); return q(`${n}-এর ${p}% কত?`, p * n / 100, near(p * n / 100, r, [p * n / 10, n - p]), `${n} × ${p} ÷ ১০০ = ${p * n / 100}।`); },
  r => { const n = int(11, 25, r); return q(`√${n * n} = ?`, n, near(n, r, [n + 1, n * 2]), `${n} × ${n} = ${n * n}।`); },
  r => { const n = int(3, 9, r); return q(`${n}${sup(3)} = ?`, n ** 3, near(n ** 3, r, [n * 3, n ** 2]), `${n} × ${n} × ${n} = ${n ** 3}।`); },
  r => { const g = int(2, 9, r), a = g * int(2, 7, r), b = g * int(2, 7, r); const G = gcd(a, b), L = a * b / G; return pick([q(`${a} ও ${b}-এর গ.সা.গু কত?`, G, near(G, r, [L, G * 2]), `দুটোকেই নিঃশেষে ভাগ করে এমন সবচেয়ে বড় সংখ্যা ${G}।`), q(`${a} ও ${b}-এর ল.সা.গু কত?`, L, near(L, r, [a * b, G]), `${a} × ${b} ÷ গ.সা.গু ${G} = ${L}।`)], r); },
  r => { const a = int(2, 9, r), x = int(-6, 12, r), b = int(-15, 20, r); return q(`${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${a * x + b} হলে x = ?`, x, near(x, r, [-x, x + 2]), `${a}x = ${a * x + b} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${a * x}, তাই x = ${x}।`); },
  r => { const m = int(2, 6, r), n = int(2, 6, r); return q(`2${sup(m)} × 2${sup(n)} = 2 এর কোন ঘাত?`, m + n, near(m + n, r, [m * n, m - n]), `একই ভিত্তির গুণে ঘাত যোগ হয়: ${m} + ${n}।`); },
  r => { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]], r); return q(`সমকোণী ত্রিভুজের দুই বাহু ${a} ও ${b}। অতিভুজ কত?`, c, near(c, r, [a + b, c + 1]), `√(${a}² + ${b}²) = √${a * a + b * b} = ${c}।`); },
  r => { const a = int(-12, -2, r), b = int(-9, 9, r); return q(`(${a}) × (${b}) − (${a}) = ?`, a * b - a, near(a * b - a, r, [a * b + a, -(a * b - a)]), `${a * b} − (${a}) = ${a * b - a}।`); },
  r => { const m = int(8, 30, r), a = int(1, 7, r), b = int(1, 7, r), xs = [m + a, m - b, m - a, m + b].sort(() => r() - .5), s = 4 * m; return q(`${xs.join(', ')}-এর গড় কত?`, m, near(m, r, [s, m + 1]), `যোগফল ${s}, ৪ দিয়ে ভাগ = ${m}।`); },
  r => { const b = int(4, 14, r) * 2, h = int(3, 12, r); return q(`ত্রিভুজের ভূমি ${b}, উচ্চতা ${h}। ক্ষেত্রফল কত?`, b * h / 2, near(b * h / 2, r, [b * h, b + h]), `½ × ${b} × ${h} = ${b * h / 2}।`); },
  r => { const p = pick([[2, 'জোড় সংখ্যা', '1/2'], [3, '৪-এর চেয়ে বড়', '1/3'], [1, '৬', '1/6']], r); return q(`একটা ছক্কা একবার ছুড়লে ${p[1]} ওঠার সম্ভাবনা কত?`, p[2], ['1/4', '2/3', '5/6', '1/2', '1/3', '1/6'].filter(x => x !== p[2]).sort(() => r() - .5).slice(0, 3), `৬টা সমান সম্ভাব্য ফলের মধ্যে অনুকূল ফল ভাগ ৬।`); },
  r => { const P = pick([1000, 2000, 5000], r), rate = pick([5, 8, 10], r), t = int(2, 4, r); return q(`${P} টাকায় বার্ষিক ${rate}% সরল মুনাফায় ${t} বছরে মুনাফা কত টাকা?`, P * rate * t / 100, near(P * rate * t / 100, r, [P * rate / 100, P * rate * t / 10]), `${P} × ${rate} × ${t} ÷ ১০০।`); }
];

const L3 = [
  r => { const p = int(1, 6, r), s = int(1, 6, r); const b = -(p + s), c = p * s; return q(`x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + ${c} = 0 সমীকরণের মূল দুটির যোগফল কত?`, p + s, near(p + s, r, [-(p + s), c]), `মূলের যোগফল = −b/a = ${p + s}।`); },
  r => { const b = pick([2, 3, 5, 10], r), k = b === 10 ? int(2, 5, r) : b === 2 ? int(3, 10, r) : int(2, 4, r); return q(`log${({ 2: '₂', 3: '₃', 5: '₅', 10: '₁₀' })[b]} ${b ** k} = ?`, k, near(k, r, [b ** k / b, k + 1]), `${b}${sup(k)} = ${b ** k}।`); },
  r => { const [f, v] = pick([['sin 30°', '1/2'], ['cos 60°', '1/2'], ['tan 45°', '1'], ['sin 90°', '1'], ['cos 0°', '1'], ['sin 60°', '√3/2'], ['cos 30°', '√3/2'], ['tan 60°', '√3'], ['tan 30°', '1/√3'], ['cos 90°', '0']], r); return q(`${f} = ?`, v, ['1/2', '1', '√3/2', '√3', '1/√3', '0', '√2/2'].filter(x => x !== v).sort(() => r() - .5).slice(0, 3), `প্রমিত কোণের মান: ${f} = ${v}।`); },
  r => { const n = int(5, 10, r), k = int(2, 3, r); return q(`${n}C${k} (${n}টা থেকে ${k}টা বাছাই) = ?`, nCr(n, k), near(nCr(n, k), r, [nCr(n, k) * (k === 2 ? 2 : 6), n * k]), `${n}! ÷ (${k}! × ${n - k}!) = ${nCr(n, k)}।`); },
  r => { const a = int(1, 9, r), d = int(2, 6, r), n = int(8, 20, r), S = n * (2 * a + (n - 1) * d) / 2; return q(`${a}, ${a + d}, ${a + 2 * d}, … ধারার প্রথম ${n}টি পদের যোগফল কত?`, S, near(S, r, [a + (n - 1) * d, S + d]), `n/2 × (2a + (n−1)d) = ${n}/2 × (${2 * a} + ${(n - 1) * d})।`); },
  r => { const a = int(1, 5, r), ratio = pick([2, 3], r), n = int(4, 7, r); return q(`${a}, ${a * ratio}, ${a * ratio * ratio}, … গুণোত্তর ধারার ${n}তম পদ কত?`, a * ratio ** (n - 1), near(a * ratio ** (n - 1), r, [a * ratio ** n, a * ratio * n]), `a·r${sup(n - 1)} = ${a} × ${ratio}${sup(n - 1)}।`); },
  r => { const a = int(2, 5, r), n = int(2, 4, r), x = int(1, 3, r); const d = a * n * x ** (n - 1); return q(`f(x) = ${a}x${sup(n)} হলে f′(${x}) = ?`, d, near(d, r, [a * x ** n, a * n]), `f′(x) = ${a * n}x${sup(n - 1)}, x = ${x} বসালে ${d}।`); },
  r => { const [a, b, m] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]], r); return q(`|${a} + ${b}i| = ?`, m, near(m, r, [a + b, m * m]), `√(${a}² + ${b}²) = ${m}।`); },
  r => { const a = int(1, 6, r), b = int(1, 6, r), c = int(1, 6, r), d = int(1, 6, r); return q(`ম্যাট্রিক্স [[${a}, ${b}], [${c}, ${d}]]-এর নির্ণায়ক কত?`, a * d - b * c, near(a * d - b * c, r, [a * d + b * c, a * b - c * d]), `${a}·${d} − ${b}·${c} = ${a * d - b * c}।`); },
  r => { const a = int(2, 5, r), b = int(1, 6, r), x = int(1, 4, r); const g = x * x, f = a * g + b; return q(`f(x) = ${a}x + ${b}, g(x) = x² হলে f(g(${x})) = ?`, f, near(f, r, [(a * x + b) ** 2, a * x + b]), `g(${x}) = ${g}, f(${g}) = ${f}।`); },
  r => { const n = int(4, 6, r); return q(`${n}টা আলাদা বই একটা তাকে কত রকমভাবে সাজানো যায়?`, [1, 1, 2, 6, 24, 120, 720][n], near([1, 1, 2, 6, 24, 120, 720][n], r, [n * n, [1, 1, 2, 6, 24, 120][n - 1]]), `${n}! = ${[1, 1, 2, 6, 24, 120, 720][n]}।`); }
];

const L4 = [
  r => { const k = int(2, 7, r); return pick([q(`d/dx [sin(${k}x)], x = 0 বিন্দুতে মান কত?`, k, near(k, r, [0, 1]), `চেইন রুল: ${k}·cos(${k}x), x = 0 তে ${k}।`), q(`d/dx [e^(${k}x)], x = 0 বিন্দুতে মান কত?`, k, near(k, r, [1, Math.E.toFixed(2)]), `${k}·e^(${k}x), x = 0 তে ${k}।`)], r); },
  r => { const n = int(1, 3, r), a = pick(n === 1 ? [2, 4, 6] : n === 2 ? [3, 6] : [2, 4], r), v = a ** (n + 1) / (n + 1); return q(`∫₀^${a} x${n > 1 ? sup(n) : ''} dx = ?`, v, near(v, r, [a ** n, a ** (n + 1)]), `x${sup(n + 1)}/${n + 1}, ০ থেকে ${a}: ${a ** (n + 1)}/${n + 1} = ${v}।`); },
  r => { const a = int(2, 9, r), b = int(2, 9, r); return pick([q(`lim(x→0) sin(${a}x)/x = ?`, a, near(a, r, [0, 1]), `sin(${a}x) ≈ ${a}x যখন x ছোট।`), q(`lim(x→0) (1 − cos x)/x² = ?`, '1/2', ['0', '1', '2'], `cos x ≈ 1 − x²/2।`), q(`lim(n→∞) (1 + ${a}/n)^n = ?`, `e^${a}`, [`${a}`, 'e', `${a}e`], `প্রমিত সীমা: (1 + a/n)^n → e^a।`), q(`lim(x→∞) (${a}x² + 1)/(${b}x² − x) = ?`, frac(a, b), [frac(b, a), '0', '∞', frac(a + 1, b)].filter(x => x !== frac(a, b)).slice(0, 3), `সর্বোচ্চ ঘাতের সহগের অনুপাত ${a}/${b}।`)], r); },
  r => { const a = int(1, 6, r), d = int(1, 6, r), c = int(1, 5, r); return q(`ম্যাট্রিক্স [[${a}, 0], [${c}, ${d}]]-এর আইগেনমানগুলোর যোগফল কত?`, a + d, near(a + d, r, [a * d, a + c + d]), `আইগেনমানের যোগফল = ট্রেস = ${a} + ${d}।`); },
  r => { const a = int(2, 9, r), k = int(5, 30, r), m = pick([5, 7, 11, 13], r); let v = 1; for (let i = 0; i < k; i++) v = v * a % m; return q(`${a}${sup(k)} mod ${m} = ?`, v, Array.from({ length: m }, (_, i) => i).filter(x => x !== v).sort(() => r() - .5).slice(0, 3), `বারবার গুণ করে ${m} দিয়ে ভাগশেষ নিলে ${v}।`); },
  r => { const n = int(19, 120, r); return pick([q(`বাইনারি ${n.toString(2)} দশমিকে কত?`, n, near(n, r, [n + 2, parseInt(n.toString(2).split('').reverse().join(''), 2)].filter(x => x !== n)), `${n.toString(2).split('').map((b, i, all) => b === '1' ? 2 ** (all.length - 1 - i) : 0).filter(Boolean).join(' + ')} = ${n}।`), q(`দশমিক ${n} হেক্সাডেসিমালে কত?`, n.toString(16).toUpperCase(), [...new Set([n + 1, n - 1, n + 16, n - 16, n + 10].map(x => x.toString(16).toUpperCase()))].filter(x => x !== n.toString(16).toUpperCase()).slice(0, 3), `${n} = ${Math.floor(n / 16)}×16 + ${n % 16}।`)], r); },
  r => pick([q('একটা নিরপেক্ষ ছক্কার প্রত্যাশিত মান E[X] কত?', '3.5', ['3', '4', '6'], '(1+2+3+4+5+6)/6 = 3.5।'), q('দুটো নিরপেক্ষ মুদ্রা ছুড়লে অন্তত একটা হেড আসার সম্ভাবনা কত?', '3/4', ['1/2', '1/4', '2/3'], '১ − P(দুটোই টেল) = ১ − ১/৪।'), q('একটা নিরপেক্ষ মুদ্রা ৩ বার ছুড়লে ঠিক ২টা হেড আসার সম্ভাবনা কত?', '3/8', ['1/2', '1/4', '2/3'], '3C2 × (1/2)³ = 3/8।')], r),
  r => { const a = [int(-3, 5, r), int(-3, 5, r), int(-3, 5, r)], b = [int(-3, 5, r), int(-3, 5, r), int(-3, 5, r)], d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; return q(`(${a.join(', ')}) · (${b.join(', ')}) = ?`, d, near(d, r, [a[0] * b[0], d + a[2]]), `${a.map((x, i) => `${x}·${b[i]}`).join(' + ')} = ${d}।`); },
  r => { const [rr, s] = pick([['1/2', '2'], ['1/3', '3/2'], ['1/4', '4/3'], ['2/3', '3']], r); return q(`1 + ${rr} + (${rr})² + (${rr})³ + … = ?`, s, ['2', '3/2', '4/3', '3', '∞', '1'].filter(x => x !== s).sort(() => r() - .5).slice(0, 3), `অসীম গুণোত্তর ধারা: 1/(1 − ${rr}) = ${s}।`); },
  r => { const n = int(5, 12, r); return q(`${n}টা শীর্ষের সম্পূর্ণ গ্রাফ Kₙ-এ কয়টা প্রান্ত (edge)?`, n * (n - 1) / 2, near(n * (n - 1) / 2, r, [n * (n - 1), n * n]), `প্রতি জোড়া শীর্ষে একটা প্রান্ত: ${n}C2 = ${n * (n - 1) / 2}।`); },
  r => { const k = int(2, 4, r); return q(`e^x-এর ম্যাকলরিন ধারায় x${sup(k)}-এর সহগ কত?`, `1/${[1, 1, 2, 6, 24][k]}`, [`1/${k}`, `${k}`, `1/${[1, 1, 2, 6, 24][k + 1] || 120}`, `1/${k * k}`, '1'].filter(x => x !== `1/${[1, 1, 2, 6, 24][k]}`).filter((x, i, all) => all.indexOf(x) === i).slice(0, 3), `x${sup(k)}/${k}! → সহগ 1/${k}! = 1/${[1, 1, 2, 6, 24][k]}।`); },
  r => { const n = pick([4, 5, 6, 7, 9, 11, 14, 23], r); return q(`i${sup(n)} = ?`, ['1', 'i', '−1', '−i'][n % 4], ['1', 'i', '−1', '−i'].filter(x => x !== ['1', 'i', '−1', '−i'][n % 4]), `i⁴ = 1, তাই i${sup(n)} = i${sup(n % 4)}।`); },
  r => pick([q('n আকারের সাজানো তালিকায় বাইনারি সার্চের সময় জটিলতা কত?', 'O(log n)', ['O(n)', 'O(n log n)', 'O(1)'], 'প্রতি ধাপে খোঁজার জায়গা অর্ধেক হয়।'), q('y′ = 2y, y(0) = 3 হলে y(x) = ?', '3e^(2x)', ['2e^(3x)', '3e^x', 'e^(2x) + 3'], 'y = Ce^(2x), x = 0 তে C = 3।'), q('∫ 1/x dx = ?', 'ln|x| + C', ['−1/x² + C', 'x⁻² + C', 'eˣ + C'], '(ln|x|)′ = 1/x।')], r)
];

export const BANKS = [L1, L2, L3, L4];

/* One question at a level (1–4), with its four options shuffled. */
export function makeQuestion(level, r = Math.random) {
  const bank = BANKS[Math.max(1, Math.min(4, level)) - 1];
  for (let tries = 0; tries < 20; tries++) {
    const item = pick(bank, r)(r), options = [...new Set([item.a, ...item.wrong])];
    if (options.length < 4) continue;
    const four = [item.a, ...options.filter(o => o !== item.a).slice(0, 3)];
    for (let i = 3; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [four[i], four[j]] = [four[j], four[i]]; }
    return { q: item.q, a: item.a, options: four, why: item.why, level };
  }
  return { q: '২ + ২ = ?', a: '4', options: ['3', '4', '5', '22'], why: '২ আর ২ যোগ করলে ৪।', level };
}
