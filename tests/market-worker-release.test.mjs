import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const worker=readFileSync(resolve('worker/market-worker-production.mjs'),'utf8');
const start=worker.indexOf('const ASSETS='),end=worker.indexOf('};\n',start);
assert.ok(start>=0&&end>start,'Saved Worker includes asset map');
const assets=JSON.parse(worker.slice(start+'const ASSETS='.length,end+1));
const js=assets['market-experience.js']||'';
const markup=assets['index.html']||'';
const footer=assets['footer-pages.js']||'';
test('production source contains the existing interactive scene and six category icons',()=>{
 assert.ok(assets['interactive-scene.js']&&assets['scene-images.js']&&assets['category-photos.js']);
 assert.ok((assets['app.js']||'').includes('room-discovery-track'));
 for(const id of ['furniture','decor','kitchen','maintenance','garden','construction'])assert.ok(js.includes(id));
});
test('all existing original footer definitions survive unchanged',()=>{
 const sections=footer.match(/"title":/g)||[];
 assert.ok(sections.length>=5);
 assert.ok((assets['app.js']||'').includes('function renderFooter()'));
 assert.ok(js.includes('footerColumns()'));
 assert.ok(js.includes("section.append(title,links)"));
 assert.ok(!js.includes('href="#"'));
});
test('responsive market script and styles are loaded by the existing index',()=>{
 assert.ok(markup.includes('href="/market-experience.css"'));
 assert.ok(markup.includes('src="/market-experience.js"'));
 const css=assets['market-experience.css']||'';
 assert.ok(css.includes('@media(max-width:720px)'));
 assert.ok(css.includes('.market-ux-scroll'));
});
test('market taxonomy is provided via the existing public, read-only Supabase RPC',()=>{
 assert.ok(worker.includes("get_marketplace_specialty_groups"));
 assert.ok(worker.includes("/api/public-market-taxonomy"));
 assert.ok(worker.includes("MARKET_TAXONOMY_PUBLIC_KEY"));
 assert.ok(!worker.includes("sb_secret_"));
 assert.ok(!worker.includes("service_role"));
});
test('do not silently convert catalogue templates into fake live offers',()=>{
 assert.ok((assets['app.js']||'').includes('لا يتوفر منتج محدد'));
 assert.ok((assets['app.js']||'').includes('لا تتوفر اختيارات'));
});
