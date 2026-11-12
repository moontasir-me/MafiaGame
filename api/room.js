import {NeonRoomStore} from '../lib/neon-store.mjs';
import {makeOnlineApi} from '../lib/online-api.mjs';
const url=process.env.DATABASE_URL||process.env.POSTGRES_URL;
let handler;
export default async function room(req,res){
 if(!handler){try{handler=makeOnlineApi({store:url?new NeonRoomStore(url):null});}catch{handler=makeOnlineApi();}}
 return handler(req,res);
}
