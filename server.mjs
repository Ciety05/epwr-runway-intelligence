import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('./',import.meta.url);
const allowed = new Set(['index.html','app.js','model.js','styles.css']);
const types = {html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
http.createServer(async(req,res)=>{
  const name = new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(name)){res.writeHead(404);res.end('Not found');return;}
  try{const content=await readFile(fileURLToPath(new URL(name,root)));res.writeHead(200,{'Content-Type':types[name.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(content);}
  catch{res.writeHead(500);res.end('Could not read file');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:'+ (process.env.PORT||4173)));
