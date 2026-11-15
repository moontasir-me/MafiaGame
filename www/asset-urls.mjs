// Upgrade saved-result illustration URLs without duplicating obsolete image files.
const games=new Set(['mafia','spy','kalidas','pen','fib','shotoronji','chor','ludo','carrom','dots','tinguti','rush']);
export function assetUrl(value){
 const source=String(value||''),path=source.replace(/^\.\//,'');
 const portrait=path.match(/^assets\/(bn|en|classic)\/([\w-]+)\.png([?#].*)?$/);
 if(portrait)return `assets/${portrait[1]}/${portrait[2]}.webp${portrait[3]||''}`;
 const classic=path.match(/^assets\/classic\/characters\.svg#(mafia|doctor|villager|police|betrayer|host)$/);
 if(classic)return `assets/classic/${classic[1]}.webp`;
 const cover=path.match(/^assets\/([\w-]+)\/cover\.svg(?:[?#].*)?$/);
 if(cover&&games.has(cover[1]))return `assets/${cover[1]}/cover-tile.webp`;
 if(path==='assets/fib/spiral.svg')return 'assets/fib/cover-tile.webp';
 if(path==='assets/kalidas/kalidas.svg')return 'assets/kalidas/poet-avatar.webp';
 if(path==='assets/shitolpati/cover.svg')return 'assets/icons/icon-192.png';
 if(/^assets\/spy\/(agent|detective)\.svg$/.test(path))return path.replace(/\.svg$/,'.webp');
 return source;
}
