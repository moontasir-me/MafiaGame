/* চোর ডাকাত পুলিশ বাবু: four folded chits, four players.
   বাবু ১০০০, পুলিশ ৮০০, ডাকাত ৫০০, চোর ৪০০. পুলিশ চোর ধরলে পুলিশ ৮০০, চোর ০;
   ভুল ধরলে পুলিশ ০, চোর তার ৪০০ রাখে। */
export const ROLES = {
  babu: { name: 'বাবু', points: 1000, colour: '#b8860b' },
  police: { name: 'পুলিশ', points: 800, colour: '#1f4e8c' },
  dakat: { name: 'ডাকাত', points: 500, colour: '#8b1e1e' },
  chor: { name: 'চোর', points: 400, colour: '#3d3d3d' }
};
export const ORDER = ['babu', 'police', 'dakat', 'chor'];

/* A shuffled set of four chits. */
export function deal(rnd = Math.random) {
  const a = ORDER.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* Rounds take turns: পুলিশ looks for the চোর in round 1, the ডাকাত in round 2, the চোর in round 3, and so on. */
export const targetOf = round => round % 2 ? 'dakat' : 'chor';

/* roles: role per player index; guess: the player index the police named; target: 'chor' or 'dakat'.
   Caught: only the one caught drops to 0, পুলিশ keeps 800. Wrong guess: পুলিশ gets 0, everyone else keeps theirs. */
export function score(roles, guess, target = 'chor') {
  const caught = roles[guess] === target;
  return roles.map(r => r === 'police' ? (caught ? 800 : 0) : r === target && caught ? 0 : ROLES[r].points);
}
