import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'.');
const port=Number(process.env.COUNTRYMAPS_PORT||4173);
const host=process.env.COUNTRYMAPS_HOST||'127.0.0.1';
const prefix=(process.env.COUNTRYMAPS_BASE_PATH||'').replace(/\/$/,'');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(prefix&&!pathname.startsWith(prefix+'/')){res.writeHead(404);res.end('Not found');return;}
  const relative=pathname.slice(prefix.length).replace(/^\/+/,'')||'index.html';
  let file=path.resolve(root,relative);
  if(file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'+new URL(req.url,'http://localhost').search});res.end();return;}
   file=path.join(file,'index.html');
  }
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request');}
}).listen(port,host,()=>console.log('CountryMaps local preview: http://'+host+':'+port+prefix+'/'));


