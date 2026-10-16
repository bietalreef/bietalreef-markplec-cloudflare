import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {categoryPhotos} from '../category-photos.js';

test('approved home category images are six distinct photographic assets',()=>{
 const names=['furniture','lighting','kitchen','maintenance','garden','construction'];
 assert.deepEqual(Object.keys(categoryPhotos),names);
 assert.equal(new Set(Object.values(categoryPhotos)).size,6,'category cards must never repeat the same photo');
 for(const key of names){
  assert.match(categoryPhotos[key],/^data:image\/webp;base64,UklG/);
  assert.ok(categoryPhotos[key].length>2000,key+' has a real optimised photo');
 }
});
test('tablet and desktop show a row of six unique photos; phone shows six icon cards',async()=>{
 const app=await readFile('dist/app.js','utf8');
 const css=await readFile('dist/showcase.css','utf8');
 assert.match(app,/import \{categoryPhotos\} from '\.\/category-photos\.js'/);
 assert.match(app,/\[\.\.\.categories\]\.reverse\(\)/);
 assert.match(app,/categoryPhotos\[c\.id==='decor'\?'lighting':c\.id\]/);
 assert.match(app,/section class="section home-categories"/);
 assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(css,/\.room-discovery\{display:none!important\}/);
 assert.match(css,/\.home-categories \.category-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});
test('source and final Worker ship matching approved photo assets without modifying real inventory',async()=>{
 const html=await readFile('dist/index.html','utf8');
 const app=await readFile('dist/app.js','utf8');
 const asset=await readFile('dist/category-photos.js','utf8');
 const worker=await readFile('dist-worker/worker.mjs','utf8');
 assert.match(html,/noindex,nofollow,noarchive/);
 assert.match(asset,/furniture:/);
 assert.match(asset,/construction:/);
 assert.match(worker,/category-photos\.js/);
 assert.match(app,/href="#results\?category=\$\{c.id\}"/);
 assert.doesNotMatch(app,/auth\.signIn|document\.cookie/);
});
