import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {data,footer,pageRecords,documentPage} from '../content/guides.mjs';
test('footer and all editorial links resolve to generated pages or valid district anchors',async()=>{
 const pages=pageRecords(data);const paths=new Set(pages.map(p=>p.path));
 const html=await readFile('dist/index.html','utf8');
 assert.ok(html.includes(footer(data)));
 for(const page of pages){
  const rendered=await readFile('dist'+page.path+'/index.html','utf8');
  assert.equal(rendered,documentPage(page,data));
  assert.equal((rendered.match(/<h1>/g)||[]).length,1);
  assert.ok(!rendered.includes('src="/app.js"'));
 }
 for(const html of [footer(data),...pages.map(p=>documentPage(p,data))]){
  for(const [,url] of html.matchAll(/href="([^"]+)"/g)){
   if(url.startsWith('https://')||url.startsWith('#')||url==='/'||url.startsWith('/#')||url.endsWith('.css'))continue;
   const [path,fragment]=url.split('#');assert.ok(paths.has(path),'Missing route: '+url);
   if(fragment){const target=pages.find(p=>p.path===path);assert.ok(target.body.includes('id="'+fragment+'"'),'Missing anchor: '+url);}
  }
 }
 assert.equal(await readFile('dist/_redirects','utf8'),'');
 assert.ok((await readFile('dist/404.html','utf8')).includes('الصفحة غير موجودة'));
});
test('editorial guide inventory has unique paths and no fabricated businesses',()=>{
 const pages=pageRecords(data);
 assert.equal(pages.length,15);assert.equal(new Set(pages.map(p=>p.path)).size,pages.length);
 assert.equal(data.areas.length,12);
 const text=JSON.stringify(data);assert.doesNotMatch(text,/BR-\d+|arkleen|alrehab|aggregateRating|telephone|priceCurrency/i);
 for(const page of pages)assert.match(documentPage(page,data),/noindex,nofollow,noarchive/);
});
