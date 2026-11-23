/* Pen shots and score helpers. Collisions never damage a pen. */
export const MAX_PULL=120;
export function penWins(p){return Number.isInteger(p.roundWins)?p.roundWins:(p.history||[]).filter(h=>h.won).length;}
export function pullImpulse(dx,dy,mass){const length=Math.hypot(dx,dy);if(length<12)return null;const force=Math.min(length,MAX_PULL)/MAX_PULL*1500*mass;return {jx:dx/length*force,jy:dy/length*force};}
export function removePenDamage(round){if(!round||round.penRules===2)return round;for(const p of round.pens){if(p.broken){p.out=false;p.fall=0;}delete p.life;delete p.broken;delete p.hits;delete p.damageAt;}round.out=(round.out||[]).filter(id=>round.pens.some(p=>p.pid===id&&p.out));round.penRules=2;return round;}
