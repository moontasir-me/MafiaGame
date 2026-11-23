import qrcode from './vendor/qrcode.mjs';
export const ONLINE_GAMES=['pen','shotoronji','ludo','carrom','dots','tinguti','rush','dhoni'];
export function invitationCode(search,length=5){const p=new URLSearchParams(search),code=(p.get('room')||p.get('code')||'').toUpperCase();return code.length===length&&/^[A-Z0-9]+$/.test(code)?code:null;}
export function onlineRoomLink(base,path,code){const game=path.split('/').pop().replace('.html','');if(!ONLINE_GAMES.includes(game)||!/^[A-Z0-9]{5}$/.test(code))throw Error('INVITE');const url=new URL('/'+game+'.html',base);url.searchParams.set('online','1');url.searchParams.set('room',code);return url.href;}
export function qrSvg(link){const qr=qrcode(0,'M');qr.addData(link);qr.make();return qr.createSvgTag({cellSize:4,margin:16,scalable:true});}
