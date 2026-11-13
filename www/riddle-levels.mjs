/* Sorts the riddles into easy, medium and hard.
   Short riddles with a one-word answer are easy; long verse, letter and word puzzles,
   number questions and multi-word answers are harder. Points follow the level. */
export const LEVELS = {
  easy: { label: 'সহজ', note: 'ছোট ধাঁধা, এক কথায় উত্তর', points: 1, lamps: 1 },
  medium: { label: 'মাঝারি', note: 'একটু লম্বা, একটু প্যাঁচ', points: 2, lamps: 2 },
  hard: { label: 'কঠিন', note: 'অক্ষরের খেলা আর লম্বা ছড়া', points: 3, lamps: 3 }
};
const TRICK = /অক্ষর|বর্ণ|শব্দ|উল্টো|উল্টা|কাটলে|যোগ|গুণ|ভাগ|কত|সংখ্যা|কয়টি|কয়জন|কতজন|কোনটি|ইংরেজি|[0-9০-৯]/;
export function riddleScore([q, a]) {
  let s = Math.min(3, q.length / 60) + Math.min(1.5, a.length / 10);
  if (TRICK.test(q)) s += 1.6;
  if (/\s/.test(a.trim())) s += .6;
  if (/[,/]| বা /.test(a)) s += .3;
  return s;
}
export const levelOf = r => { const s = riddleScore(r); return s <= 1.45 ? 'easy' : s <= 2.75 ? 'medium' : 'hard'; };
export function byLevel(riddles) {
  const out = { easy: [], medium: [], hard: [] };
  riddles.forEach((r, i) => out[levelOf(r)].push(i));
  return out;
}
