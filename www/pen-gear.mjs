/* Pens and the bench-shop add-ons for পেন ফাইট. Kept apart from the page so the numbers can be tested. */

export const PENS = {
  pinpoint: { name: 'Matador Pinpoint', short: 'পিনপয়েন্ট', L: 150, m: 1, grip: 1, body: '#f4f6f8', cap: '#1d4fa3', note: 'মাঝারি ওজন, সোজা চলে' },
  hischool: { name: 'Matador Hi-School', short: 'হাই-স্কুল', L: 162, m: 1.22, grip: 1.1, body: '#fdf7e6', cap: '#c62828', note: 'লম্বা আর ভারী, সহজে পড়ে না' },
  iteen: { name: 'Matador i-Teen', short: 'আই-টিন', L: 136, m: 0.84, grip: 0.9, body: '#6ec3e8', cap: '#ffffff', note: 'হালকা, জোরে ছোটে' },
  econo: { name: 'Econo DX', short: 'ইকোনো', L: 146, m: 1.05, grip: 0.97, body: '#dfe9ef', cap: '#0b2f6b', note: 'ঘুরে গিয়ে ধাক্কা দেয়' }
};

// Expensive pens for the Pro version: shown on the shelf, locked for now.
export const PRO_PENS = {
  montblanc: { name: 'Montblanc Meisterstück 149', note: 'ফাউন্টেন পেন · সোনার নিব', body: '#141414', cap: '#141414', trim: '#d4af37' },
  parker: { name: 'Parker Sonnet', note: 'ফাউন্টেন পেন · স্টিলের ক্লিপ', body: '#7a1020', cap: '#c9ccd1', trim: '#c9ccd1' },
  pelikan: { name: 'Pelikan Souverän M800', note: 'ফাউন্টেন পেন · সবুজ ডোরা', body: '#1f5e3a', cap: '#111', trim: '#d4af37' },
  lamy: { name: 'Lamy 2000', note: 'ফাউন্টেন পেন · মাকরোলন বডি', body: '#2b2b2b', cap: '#2b2b2b', trim: '#b9bcc0' },
  waterman: { name: 'Waterman Carène', note: 'ফাউন্টেন পেন · ঝকঝকে বার্নিশ', body: '#0c2a5c', cap: '#0c2a5c', trim: '#d4af37' }
};

/* Add-ons bought with coins won in fights. max > 1 means it can be stacked. */
export const GEAR = {
  gripper: { name: 'রাবার গ্রিপার', note: 'প্রতিটা গ্রিপারে বেঞ্চ আঁকড়ে ধরে বেশি, কলমও একটু ভারী হয়।', price: [8, 12, 16], max: 3, icon: 'grip' },
  head: { name: 'ভারী পিতলের মাথা', note: 'সামনে ধাতুর মাথা: ধাক্কা জোরালো, নিজে সহজে সরে না।', price: [16], max: 1, icon: 'head' },
  back: { name: 'পেছনে বাড়তি মাথা', note: 'কলমের পেছনেও একটা মাথা: কলম লম্বা হয়, নাগাল বাড়ে।', price: [18], max: 1, icon: 'back' },
  tape: { name: 'স্কচটেপ মোড়ানো', note: 'টেপের খসখসে গা: ধাক্কা খেয়ে কলম কম ঘোরে।', price: [10], max: 1, icon: 'tape' },
  rubber: { name: 'ইরেজার বাম্পার', note: 'মাথায় ইরেজার: লাগলে অন্য কলম ছিটকে যায় বেশি।', price: [14], max: 1, icon: 'rubber' },
  clip: { name: 'স্টিলের ক্লিপ', note: 'ক্লিপের ওজন আর একটু বাড়তি গ্রিপ।', price: [6], max: 1, icon: 'clip' }
};
export const GEAR_KEYS = Object.keys(GEAR);

export const cleanGear = g => Object.fromEntries(GEAR_KEYS.map(k => [k, Math.max(0, Math.min(GEAR[k].max, Math.floor(Number(g?.[k]) || 0)))]));
export const nextPrice = (key, owned) => GEAR[key].price[owned] ?? null;

/* What a pen weighs and how it grips with the add-ons fitted. */
export function penStats(penKey, gear = {}) {
  const spec = PENS[penKey] || PENS.pinpoint, g = cleanGear(gear);
  let m = spec.m, grip = spec.grip, L = spec.L, spin = 1, bounce = .75;
  m *= 1 + .08 * g.gripper; grip *= 1 + .22 * g.gripper;
  if (g.head) m *= 1.35;
  if (g.back) { L += 24; m *= 1.12; }
  if (g.tape) { spin = 2; grip *= 1.06; }
  if (g.rubber) bounce = .95;
  if (g.clip) { m *= 1.1; grip *= 1.08; }
  return { L, m, grip, spin, bounce, I: m * L * L / 12 };
}

/* Short star ratings shown in the shop and on player rows. */
export function ratings(penKey, gear) {
  const s = penStats(penKey, gear), star = (v, lo, hi) => Math.max(1, Math.min(5, Math.round(1 + (v - lo) / (hi - lo) * 4)));
  return { weight: star(s.m, .8, 2.2), grip: star(s.grip, .85, 2), reach: star(s.L, 134, 190) };
}
