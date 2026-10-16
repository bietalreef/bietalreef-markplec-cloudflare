import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';

// Build the same Worker module used for the published TEST hostname.
// Static assets are embedded and never read from the live marketplace.
const dir='dist', output='dist-worker';
const files=['index.html','app.js','styles.css','footer-pages.js','footer-ux.css','mobile-ux.css','scene-ux.css','showcase.css','interactive-scene.js','scene-images.js','category-photos.js','routes.js'];
const assets=Object.fromEntries(await Promise.all(files.map(async x=>[x,await readFile(join(dir,x),'utf8')])));
assets['robots.txt']='User-agent: *\nDisallow: /\n';
const worker=`const ASSETS=${JSON.stringify(assets)};
const MIME={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',txt:'text/plain; charset=utf-8'};
const H={'X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'geolocation=(), microphone=(), camera=()','Cross-Origin-Opener-Policy':'same-origin','Cache-Control':'public, max-age=60'};
export default {async fetch(request) {
 const url=new URL(request.url);
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{...H,Allow:'GET, HEAD'}});
 let path=url.pathname;
 if(path==='/'||path==='/index.html')path='index.html';
 else if(path.startsWith('/')&&!path.slice(1).includes('/'))path=decodeURIComponent(path.slice(1));
 else return new Response('Not found',{status:404,headers:H});
 if(!Object.hasOwn(ASSETS,path))return new Response('Not found',{status:404,headers:H});
 const headers={...H,'Content-Type':MIME[path.split('.').pop()]||'application/octet-stream'};
 if(path==='index.html')headers['Content-Security-Policy']="default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; form-action 'self'";
 return new Response(request.method==='HEAD'?null:ASSETS[path],{status:200,headers});
}};
`;
await mkdir(output,{recursive:true});
await writeFile(join(output,'worker.mjs'),worker,'utf8');
console.log('Produced nonindexed Worker test build:',worker.length,'bytes');
