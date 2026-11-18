/* Pen durability is shared by real shots, computer simulations, and online replays. */
export const MAX_LIFE=100,MAX_PULL=120;
export const lifeOf=p=>p.out?0:Math.max(0,Math.min(MAX_LIFE,Number.isFinite(p.life)?p.life:MAX_LIFE));
export function hitPen(p,speed,time){
 if(p.out||!Number.isFinite(speed)||speed<90||time-(p.damageAt??-10)<.18)return 0;
 const damage=Math.max(4,Math.min(32,Math.round((speed-60)/18)))*(p.gear?.tape ? .9 : 1);
 const before=lifeOf(p);p.life=Math.max(0,Math.round(before-damage));p.hits=(p.hits||0)+1;p.damageAt=time;return before-p.life;
}
export function penWins(p){return Number.isInteger(p.roundWins)?p.roundWins:(p.history||[]).filter(h=>h.won).length;}
export function pullImpulse(dx,dy,mass){const length=Math.hypot(dx,dy);if(length<12)return null;const force=Math.min(length,MAX_PULL)/MAX_PULL*1500*mass;return {jx:dx/length*force,jy:dy/length*force};}
