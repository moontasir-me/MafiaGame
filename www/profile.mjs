const KEY='mafia.profile.v2';
export function validPhoto(value){return typeof value==='string'&&value.length<=150000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)?value:'';}
export function cleanHistory(history){return Array.isArray(history)?history.slice(0,5).filter(h=>h&&['HOST','MAFIA','DOCTOR','POLICE','VILLAGER','BETRAYER','ASTROLOGER','BODYGUARD'].includes(h.role)).map(h=>({game:String(h.game||'').slice(0,70),role:h.role,characterIndex:Number.isInteger(h.characterIndex)?h.characterIndex:0,locale:h.locale==='en'?'en':'bn',won:!!h.won,points:Number.isSafeInteger(h.points)?h.points:0,date:String(h.date||'').slice(0,40)})):[];}
export function cleanProfile(value={}){value=value&&typeof value==='object'?value:{};return {id:typeof value.id==='string'&&/^[a-zA-Z0-9-]{16,64}$/.test(value.id)?value.id:Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join(''),name:typeof value.name==='string'?value.name.trim().slice(0,20):'',photo:validPhoto(value.photo),score:Number.isSafeInteger(value.score)&&Math.abs(value.score)<=99999?value.score:0,history:cleanHistory(value.history)};}
export function readProfile(storage=localStorage){try{return cleanProfile(JSON.parse(storage.getItem(KEY))||{});}catch{return cleanProfile();}}
export function saveProfile(profile,storage=localStorage){const clean=cleanProfile(profile);storage.setItem(KEY,JSON.stringify(clean));return clean;}
export async function photoFromFile(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('PHOTO');
 const url=URL.createObjectURL(file);
 try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas'),scale=Math.min(1,240/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',0.78);if(!validPhoto(data))throw Error('PHOTO');return data;}finally{URL.revokeObjectURL(url);}
}
