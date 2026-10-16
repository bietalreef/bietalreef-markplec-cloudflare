import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const path='dist/';
test('phone and tablet receive the same shopping navigation and a mobile stylesheet',async()=>{
 const html=await readFile(path+'index.html','utf8');
 const css=await readFile(path+'mobile-ux.css','utf8');
 assert.match(html,/href="\/mobile-ux\.css"/);
 for(const route of ['#home','#categories','#results?type=product','#results?type=service','#results?type=offer']){
  assert.ok(html.includes(route),route);
 }
 assert.match(css,/@media \(max-width:720px\)/);
 assert.match(css,/@media \(min-width:721px\) and \(max-width:1100px\)/);
 assert.match(css,/\.footer-guide-grid\s*\{\s*align-items:\s*start/);
 assert.match(css,/\.category-grid\s*\{\s*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/prefers-reduced-motion/);
});
test('no debugging or implementation copy appears in the shopping header',async()=>{
 const html=await readFile(path+'index.html','utf8');
 const app=await readFile(path+'app.js','utf8');
 assert.doesNotMatch(html,/بيئة تطوير|نموذج تجربة جديد|نسخة منشورة غير مفهرسة/);
 assert.doesNotMatch(app,/تصميم قبل ربط التشغيل|نموذج العمل وقنوات العرض/);
 assert.match(app,/من قطعة أثاث تحبها إلى خدمة تحتاجها/);
 assert.match(app,/من فكرتك إلى اختيارك المناسب/);
 assert.match(html,/noindex,nofollow,noarchive/);
});
test('the optional dimensional visual has graceful reduced-motion fallback',async()=>{
 const css=await readFile(path+'mobile-ux.css','utf8');
 assert.match(css,/perspective:\s*940px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/@import|@font-face/);
});
