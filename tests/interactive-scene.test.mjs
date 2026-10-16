import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sceneItems,sceneStatus} from '../interactive-scene.js';

test('public market is guest-only, no auth state or app session takeover',async()=>{
 const src=await readFile('dist/app.js','utf8');
 const html=await readFile('dist/index.html','utf8');
 assert.doesNotMatch(src,/localStorage|sessionStorage|document\.cookie|signInWith|auth\.signIn|setCookie\(/);
 assert.doesNotMatch(html,/<input[^>]+type="password"|<form[^>]+id="login"/);
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 assert.match(src,/credentials:'omit'/);
});
test('guest online badge is truthful and accessible',async()=>{
 const src=await readFile('dist/app.js','utf8');
 const html=await readFile('dist/index.html','utf8');
 assert.match(html,/id="market-connection-status"/);
 assert.match(src,/verifyPublicConnection/);
 assert.match(src,/response\.ok/);
 assert.match(src,/متصل الآن/);
 assert.match(src,/غير متصل/);
});
test('hotspots are data-free discovery guides, not fake listings',async()=>{
 assert.equal(sceneItems.length,4);
 assert.equal(sceneStatus,'discovery-only');
 assert.deepEqual(new Set(sceneItems.map(x=>x.kind)),new Set(['product','service','offer']));
 for(const item of sceneItems){
   assert.match(item.href,/^#results\?type=(product|service|offer)/);
   assert.ok(item.label.length>2 && item.detail.length>8);
   for(const shape of ['mobile','wide']){
     assert.equal(item.coords[shape].length,2);
     assert.ok(item.coords[shape].every(x=>x>0&&x<100));
   }
   assert.equal(item.price,undefined);
 }
});
test('responsive page uses accessible hotspots with phone and wide coordinates',async()=>{
 const src=await readFile('dist/app.js','utf8');
 const css=await readFile('dist/scene-ux.css','utf8');
 const html=await readFile('dist/index.html','utf8');
 assert.match(src,/sceneButtons\(\)/);
 assert.match(src,/data-scene="/);
 assert.match(src,/showSceneDetail/);
 assert.match(css,/--wide-x/);
 assert.match(css,/--mobile-x/);
 assert.match(css,/\.scene-art-wide\{display:none\}/);
 assert.match(css,/max-width:720px/);
 assert.match(css,/white-space:nowrap/);
 assert.match(html,/aria-labelledby="scene-dialog-title"/);
});
test('all assets copied into nonindexed worker build',async()=>{
 const worker=await readFile('dist-worker/worker.mjs','utf8');
 assert.match(worker,/interactive-scene\.js/);
 assert.match(worker,/scene-ux\.css/);
 assert.match(worker,/noindex, nofollow, noarchive/);
 assert.doesNotMatch(worker,/SUPABASE_SERVICE_ROLE_KEY|PRIVATE_API_KEY/);
});


test('the real original room photograph has separate tablet and phone assets',async()=>{
 const app=await readFile('dist/app.js','utf8');
 const photos=await readFile('dist/scene-images.js','utf8');
 const css=await readFile('dist/showcase.css','utf8');
 const html=await readFile('dist/index.html','utf8');
 assert.match(app,/import \{sceneImages\} from '\.\/scene-images\.js'/);
 assert.match(app,/<picture class="hero-photograph">/);
 assert.match(app,/sceneImages\.mobile/);
 assert.match(app,/sceneImages\.wide/);
 assert.match(app,/room-discovery-track/);
 assert.match(photos,/data:image\/webp;base64,UklG/);
 const matches=photos.match(/data:image\/webp;base64,UklG/g)||[];
 assert.equal(matches.length,2);
 assert.ok(photos.length>100000,'must be genuine optimized photo files, not placeholder URLs');
 assert.match(html,/href="\/showcase\.css"/);
 assert.match(css,/hero-photograph img/);
 assert.match(css,/hero-photo>\.hero-copy/);
 assert.match(css,/min-height:510px/);
 assert.match(css,/prefers-reduced-motion/);
});
