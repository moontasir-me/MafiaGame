import {viewFor} from './rush-engine.mjs';
export const humanSeats=seats=>seats.map((p,i)=>p.cpu?null:i).filter(i=>i!==null);
export function prepareRushSeat(game,seats,seat,ready){
 const people=humanSeats(seats);
 if(people.length===1)return {seat:people[0],ready:true};
 if(seats[game.turn]?.cpu)return {seat,ready:false};
 return {seat:game.turn,ready:game.turn===seat&&ready};
}
export function needsRushHandoff(game,seats,seat,ready){return game.winner===null&&humanSeats(seats).length>1&&!seats[game.turn]?.cpu&&(!ready||seat!==game.turn);}
export function privateRushView(game,seats,seat,ready){return viewFor(game,humanSeats(seats).length>1&&!ready?-1:seat);}
