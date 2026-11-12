import {OnlineRooms,digest} from './online-rooms.mjs';
const ERRORS=new Set(['NAME','COUNTS','ASSIGNMENT_COUNTS','MISSING_ASSIGNMENTS','CLASSIC_ROLES','STARTED','FULL','PHASE','ACTION','UNIVERSE','PLAYER','WINNER','TIMER','TWO_MAX','VOTING_CLOSED','ALREADY_VOTED','CANNOT_VOTE','INVALID_TARGET','VOTES_EXIST','VOTING_OPEN','JOTISHI_IMMUNE','INVALID_ELIMINATION','GUESS','ALREADY_JOINED','HOST_BETWEEN_GAMES','STALE']);
export function makeOnlineApi({store,protocol='https',getIp=req=>req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']?.split(',')[0]||'unknown'}={}){
 const rooms=store?new OnlineRooms(store):null;
 return async(req,res)=>{
  const json=(status,data)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.statusCode=status;res.end(JSON.stringify(data));};
  try{
   const url=new URL(req.url,`${protocol}://${req.headers.host}`),route=url.searchParams.get('route')||req.query?.route||url.pathname.split('/').at(-1),path='/api/'+route;
   if(req.headers.origin&&req.headers.origin!==`${protocol}://${req.headers.host}`)return json(403,{error:'ORIGIN'});
   if(req.headers['sec-fetch-site']==='cross-site')return json(403,{error:'ORIGIN'});
   if(path==='/api/network'&&req.method==='GET'){if(store)await store.init();return json(200,{mode:'online',available:!!store,addresses:[]});}
   if(!['create','join','state','rankings','inspect','action','profile'].includes(route))return json(404,{error:'NOT_FOUND'});
   if(req.method!=='POST'){res.setHeader('Allow','POST');return json(405,{error:'METHOD'});}
   if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'CONTENT_TYPE'});
   if(!store)return json(503,{error:'ONLINE_NOT_CONFIGURED'});
   let body=req.body;if(body===undefined){let raw='',size=0;for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>256000)return json(413,{error:'SIZE'});raw+=chunk;}try{body=JSON.parse(raw);}catch{return json(400,{error:'REQUEST'});}}
   else{if(Buffer.byteLength(typeof body==='string'?body:JSON.stringify(body))>256000)return json(413,{error:'SIZE'});if(typeof body==='string'){try{body=JSON.parse(body);}catch{return json(400,{error:'REQUEST'});}}}
   if(!body||typeof body!=='object'||Array.isArray(body))return json(400,{error:'REQUEST'});
   const ip=digest(String(getIp(req)).slice(0,200));
   if(['create','join'].includes(route)&&!await store.allowRate(route+':'+ip,route==='create'?10:60,route==='create'?3600:60)){res.setHeader('Retry-After',route==='create'?'3600':'60');return json(429,{error:'RATE_LIMIT'});}
   const result=await rooms.handle(path,body);if(route==='create')await store.cleanup().catch(e=>console.error('Room cleanup deferred:',e.code||e.name));return json(200,result);
  }catch(e){
   if(e.message==='ROOM_GONE')return json(404,{error:e.message});
   if(['AUTH','INVITE','HOST_ONLY'].includes(e.message))return json(403,{error:e.message});
   if(e.message==='BUSY')return json(409,{error:'BUSY'});
   if(ERRORS.has(e.message))return json(400,{error:e.message});
   // Never expose connection strings, SQL parameters, snapshots, or driver errors.
   console.error('Online room storage unavailable:',e.code||e.name);return json(503,{error:'BACKEND_UNAVAILABLE'});
  }
 };
}
