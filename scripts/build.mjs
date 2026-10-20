import {mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {data,pageRecords,documentPage} from '../content/guides.mjs';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const name of ['index.html','styles.css','app.js','routes.js','content.css'])await copyFile(name,`dist/${name}`);
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');
await writeFile('dist/_headers',`/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'
`);
await writeFile('dist/_redirects','/* /index.html 200\n');
await writeFile('dist/version.json',JSON.stringify({project:'bietalreef-marketplace',environment:'development',dataConnected:false,repository:'bietalreef/bietalreef-markplec-cloudflare',commit:process.env.COMMIT_SHA||'local',builtAt:new Date().toISOString()},null,2));
console.log('Built fresh development prototype. No production data connection. Indexing disabled.');

// Render complete editorial documents; no client-side JavaScript or company fixtures required.
for (const page of pageRecords(data)) {
  await mkdir('dist'+page.path,{recursive:true});
  await writeFile('dist'+page.path+'/index.html',documentPage(page,data));
}
// A genuine not-found page prevents unknown content URLs falling back to the home screen.
await writeFile('dist/404.html',documentPage({title:'الصفحة غير موجودة',intro:'تعذر العثور على الصفحة المطلوبة. يمكنك العودة إلى دليل السوق.',body:'<a href="/sitemap">خريطة صفحات الدليل</a>'},data));
await writeFile('dist/_redirects','');
console.log('Rendered '+pageRecords(data).length+' editorial routes. Staging indexing remains disabled.');
