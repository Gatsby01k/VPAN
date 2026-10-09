import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const PUBLIC=path.resolve(HERE,'public');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const STATUSES=new Set(['new','review','qualified','discussion','agreed','closed']);
const ROLES=new Set(['affiliate','team','provider','regional']);
const safeText=(value,max=180)=>typeof value==='string'?value.trim().slice(0,max):'';
const reply=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body))};
const secureCompare=(a,b)=>{if(!a||!b)return false;const ah=crypto.createHash('sha256').update(a).digest(),bh=crypto.createHash('sha256').update(b).digest();return crypto.timingSafeEqual(ah,bh)};
async function jsonBody(req){let content='';for await(const c of req){content+=c;if(content.length>12000)throw Object.assign(new Error('Request is too large'),{status:413})}try{return JSON.parse(content)}catch{throw Object.assign(new Error('Invalid JSON'),{status:400})}}
function openDatabase(dbPath){fs.mkdirSync(path.dirname(dbPath),{recursive:true});const db=new DatabaseSync(dbPath);db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS applications(
 id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, reference TEXT UNIQUE NOT NULL,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL, role TEXT NOT NULL, markets TEXT NOT NULL,
 name TEXT NOT NULL, company TEXT, email TEXT NOT NULL, telegram TEXT,
 size TEXT, methods TEXT, volume TEXT, experience TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,application_id TEXT NOT NULL,at TEXT NOT NULL,from_status TEXT,to_status TEXT NOT NULL);`);return db}
function serveFile(req,res,urlPath){let filename;try{filename=decodeURIComponent(urlPath)}catch{return reply(res,400,{error:'Bad path'})};if(filename.includes('\0')||filename.includes('\\'))return reply(res,400,{error:'Bad path'});let candidate=path.resolve(PUBLIC,'.'+filename);if(!(candidate===PUBLIC||candidate.startsWith(PUBLIC+path.sep)))return reply(res,403,{error:'Forbidden'});if(!fs.existsSync(candidate)||!fs.statSync(candidate).isFile())candidate=path.join(PUBLIC,'index.html');const ext=path.extname(candidate);if(!TYPES[ext])return reply(res,404,{error:'Not found'});res.writeHead(200,{'Content-Type':TYPES[ext],'Cache-Control':ext==='.webp'?'public,max-age=604800,immutable':'no-cache'});if(req.method==='HEAD')return res.end();fs.createReadStream(candidate).pipe(res)}
export function createApp({dbPath=path.resolve(HERE,process.env.DB_PATH||'./data/partners.sqlite'),adminToken=process.env.ADMIN_TOKEN||'',allowedOrigin=process.env.ALLOWED_ORIGIN||'',trustProxy=process.env.TRUST_PROXY==='1'}={}){
const db=openDatabase(dbPath);const attempts=new Map();let server;
const handler=async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 const requestUrl=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);const pathname=requestUrl.pathname;
 if(req.method==='GET'&&pathname==='/health')return reply(res,200,{status:'ok'});
 if(pathname.startsWith('/api/')){
  if(req.method==='POST'&&pathname==='/api/apply'){
   if(allowedOrigin&&req.headers.origin&&req.headers.origin!==allowedOrigin)return reply(res,403,{error:'This request origin is not allowed.'});
   const addr=(trustProxy?req.headers['x-forwarded-for']?.split(',')[0]?.trim():null)||req.socket.remoteAddress||'unknown';let record=attempts.get(addr)||{count:0,until:Date.now()+3600000};if(Date.now()>record.until)record={count:0,until:Date.now()+3600000};record.count++;attempts.set(addr,record);if(attempts.size>5000){for(const [ip,r] of attempts){if(Date.now()>r.until)attempts.delete(ip)}}if(record.count>8)return reply(res,429,{error:'Too many applications. Please try later.'});
   const b=await jsonBody(req);if(safeText(b.site,80))return reply(res,200,{reference:'PAN-RECEIVED'});
   const requestKey=safeText(b.requestId,75);if(!/^[a-f0-9-]{36}$/i.test(requestKey))return reply(res,400,{error:'Invalid request ID.'});
   const existing=db.prepare('SELECT reference FROM applications WHERE request_key = ?').get(requestKey);if(existing)return reply(res,200,{reference:existing.reference});
   const role=safeText(b.role,40);const name=safeText(b.name);const email=safeText(b.email).toLowerCase();const markets=Array.isArray(b.markets)?b.markets.slice(0,10).map(x=>safeText(x,60)).filter(Boolean):[];
   if(!ROLES.has(role)||name.length<2||markets.length===0||markets.join('').length>250||!/^\S+@\S+\.\S+$/.test(email)||email.length>180)return reply(res,422,{error:'Please complete the required fields with valid information.'});
   const now=new Date().toISOString(),id=crypto.randomUUID(),reference='PAN-'+new Date().getUTCFullYear()+'-'+crypto.randomBytes(4).toString('hex').toUpperCase();
   db.prepare(`INSERT INTO applications(id,request_key,reference,created_at,updated_at,role,markets,name,company,email,telegram,size,methods,volume,experience,message,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,requestKey,reference,now,now,role,markets.join(', '),name,safeText(b.company),email,safeText(b.telegram),safeText(b.size),safeText(b.methods),safeText(b.volume),safeText(b.experience),safeText(b.message,1500),'new');
   return reply(res,201,{reference});
  }
  if(pathname.startsWith('/api/admin/')){
   if(!secureCompare(String(req.headers.authorization||'').replace(/^Bearer\s+/i,''),adminToken))return reply(res,401,{error:'Unauthorized'});
   if(req.method==='GET'&&pathname==='/api/admin/applications'){const items=db.prepare('SELECT id,reference,created_at,role,markets,name,company,email,telegram,size,methods,volume,experience,message,status FROM applications ORDER BY created_at DESC LIMIT 500').all();return reply(res,200,{items})}
   const match=pathname.match(/^\/api\/admin\/applications\/([a-f0-9-]{36})$/i);
   if(req.method==='PATCH'&&match){const body=await jsonBody(req);const next=safeText(body.status,40);if(!STATUSES.has(next))return reply(res,422,{error:'Unknown status'});const current=db.prepare('SELECT status FROM applications WHERE id=?').get(match[1]);if(!current)return reply(res,404,{error:'Application not found'});db.prepare('UPDATE applications SET status=?,updated_at=? WHERE id=?').run(next,new Date().toISOString(),match[1]);db.prepare('INSERT INTO audit_log(application_id,at,from_status,to_status) VALUES(?,?,?,?)').run(match[1],new Date().toISOString(),current.status,next);return reply(res,200,{ok:true})}
  }
  return reply(res,404,{error:'Not found'});
 }
 if(req.method==='GET'||req.method==='HEAD')return serveFile(req,res,pathname);
 return reply(res,405,{error:'Method not allowed'});
};
server=http.createServer((req,res)=>{Promise.resolve(handler(req,res)).catch(err=>{if(!res.headersSent)reply(res,err.status||500,{error:err.status?err.message:'Server error'});else res.destroy()})});
server.on('close',()=>db.close());return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||3000),host=process.env.HOST||'0.0.0.0';const server=createApp();server.listen(port,host,()=>process.stdout.write(`PAN running on http://${host}:${port}\n`));
}