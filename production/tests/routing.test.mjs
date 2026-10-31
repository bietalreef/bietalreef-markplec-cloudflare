import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/worker.mjs';
import {fromLegacy,toLegacy} from '../route-map.mjs';
import {footerSections} from '../assets/footer-pages.js';
const origin='https://app.bietalreef.ae';
const response=(path,method='GET')=>worker.fetch(new Request(origin+path,{method}));

test('legacy page fragments map to equivalent real paths and retain filters',()=>{
 const cases=[['#home','/'],['#studio','/studio'],['#section?category=kitchen','/categories/kitchen'],['#results?category=furniture&type=product','/search?category=furniture&type=product'],['#info?slug=how-to-buy','/how-to-buy'],['#vision?area=studio','/experiences/design'],['#vision?area=showroom','/experiences/stores'],['#vision?area=projects','/experiences/contracting-services'],['#partners','/experiences/partnerships'],['#detail?type=product','/listing?type=product'],['#store','/store']];
 for(const [fragment,path] of cases){assert.equal(fromLegacy(fragment),path);const u=new URL(path,origin);assert.equal(toLegacy(u.pathname,u.search),fragment)}
 assert.equal(toLegacy('/en/categories/kitchen','?utm_source=google'),'#section?category=kitchen');
 assert.equal(fromLegacy('#content'),null);assert.equal(fromLegacy('#unknown'),null);
});

test('all footer destinations resolve directly in both languages',async()=>{
 const all=new Set(footerSections.flatMap(s=>s.links.map(x=>x[1])));
 for(const link of all){const path=fromLegacy(link);assert.ok(path,link);for(const prefix of ['','/en']){const r=await response(prefix+path);assert.equal(r.status,200,prefix+path);assert.match(r.headers.get('content-type'),/text\/html/);}}
});

test('sitemap pages return HTML with one canonical, valid language alternates and meaningful content',async()=>{
 const sitemap=await (await response('/sitemap.xml')).text();const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.ok(urls.length>70);
 assert.equal(new Set(urls).size,urls.length);
 for(const url of urls){const path=new URL(url).pathname;const r=await response(path);assert.equal(r.status,200,path);const body=await r.text();assert.match(body,/<h1(?:\s[^>]*)?>/,path);if(path==='/google-workspace-offer')continue;const canon=[...body.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(canon,[url],path);assert.match(body,/hreflang="ar-AE"/);assert.match(body,/hreflang="en-AE"/);assert.ok(r.headers.get('content-security-policy'),path);const hashes=[...body.matchAll(/href="(#[^"]+)"/g)].map(x=>x[1]);assert.deepEqual(hashes,['#content'],path)}
});

test('search and placeholder pages have a single noindex directive; unknown pages are 404',async()=>{
 for(const path of ['/search?q=table&utm_source=test','/en/search?q=table','/cart','/listing?type=product','/store']){const r=await response(path);assert.equal(r.status,200,path);const h=await r.text();assert.deepEqual([...h.matchAll(/name="robots" content="([^"]+)/g)].map(x=>x[1]),['noindex,follow']);assert.ok(!h.match(/<link rel="canonical"[^>]*utm_/));}
 assert.equal((await response('/does-not-exist')).status,404);
});

test('canonical slashes redirect and preserve campaign parameters',async()=>{
 for(const [path,target] of [['/en','/en/'],['/index.html','/'],['/en/categories/kitchen/?utm_source=test','/en/categories/kitchen?utm_source=test']]){const r=await response(path);assert.equal(r.status,301);assert.equal(r.headers.get('location'),origin+target)}
});

test('home includes four real experience links and versioned scripts',async()=>{
 const text=await (await response('/')).text();for(const p of ['/experiences/design','/experiences/stores','/experiences/contracting-services','/experiences/partnerships'])assert.ok(text.includes(`href="${p}"`),p);assert.match(text,/src="\/route-bridge\.js\?v=[a-f0-9]+"/);assert.equal((await response('/studio','HEAD')).status,200);
});
