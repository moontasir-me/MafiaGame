import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {networkInterfaces} from 'node:os';
import path from 'node:path';
import {RoomService} from './www/room-service.mjs';
const root=fileURLToPath(new URL('./www/',import.meta.url));
const types={'.ttf':'font/ttf','.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
export function createMafiaServer({rooms=new RoomService()}={}){
 const server=http.createServer(async(req,res)=>{
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname.startsWith('/api/')){
    if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`){json(403,{error:'ORIGIN'});return;}
    if(pathname==='/api/network'&&req.method==='GET'){
     const port=server.address().port;
     json(200,{addresses:Object.values(networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal).map(a=>`http://${a.address}:${port}`)});return;
    }
    if(req.method!=='POST'||!req.headers['content-type']?.startsWith('application/json')){json(405,{error:'METHOD'});return;}
    let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>256000){json(413,{error:'SIZE'});return;}body+=chunk;}
    const data=JSON.parse(body);if(!data||typeof data!=='object'||Array.isArray(data))throw Error('REQUEST');
    json(200,await rooms.handle(pathname,data));return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
   const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   if(!file.startsWith(root)){res.writeHead(403);res.end();return;}
   const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch(error){if(req.url.startsWith('/api/'))json(400,{error:error.message});else{res.writeHead(404);res.end('Not found');}}
 });
 return server;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))createMafiaServer().listen(Number(process.env.PORT||5173),'0.0.0.0',()=>console.log('Mafia is ready at http://localhost:'+(process.env.PORT||5173)));
