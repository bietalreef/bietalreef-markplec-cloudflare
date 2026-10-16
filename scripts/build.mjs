import {mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const name of ['index.html','styles.css','footer-ux.css','mobile-ux.css','scene-ux.css','showcase.css','interactive-scene.js','scene-images.js','footer-pages.js','app.js','routes.js'])await copyFile(name,`dist/${name}`);
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');
await writeFile('dist/_headers',`/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'
`);
await writeFile('dist/_redirects','/* /index.html 200\n');
await writeFile('dist/version.json',JSON.stringify({project:'bietalreef-marketplace',environment:'development',dataConnected:false,repository:'bietalreef/bietalreef-markplec-cloudflare',commit:process.env.COMMIT_SHA||'local',builtAt:new Date().toISOString()},null,2));
console.log('Built fresh development prototype. No production data connection. Indexing disabled.');
