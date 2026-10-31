import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/worker.mjs';
import {fromLegacy,toLegacy} from '../route-map.mjs';
import {footerSections} from '../assets/footer-pages.js';
import fs from 'node:fs';
const origin='https://app.bietalreef.ae';
const response=(path,method='GET')=>worker.fetch(new Request(origin+path,{method}));
const fixture=JSON.parse(fs.readFileSync(new URL('../experience-pages.json',import.meta.url),'utf8'));
let published=structuredClone(fixture);
const realFetch=globalThis.fetch;
globalThis.fetch=(input,init)=>String(input).includes('/rest/v1/marketplace_experience_pages?')?Promise.resolve(new Response(JSON.stringify(Object.values(published).map(content=>({slug:content.slug,content}))),{headers:{'content-type':'application/json'}})):realFetch(input,init);

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

test('each experience delivers the same useful bilingual story, multiple images and valid actions in initial HTML',async()=>{
 const pages=JSON.parse(fs.readFileSync(new URL('../experience-pages.json',import.meta.url),'utf8'));
 for(const page of Object.values(pages))for(const [language,prefix] of [['ar',''],['en','/en']]){
  const path=prefix+'/experiences/'+page.slug, res=await response(path), html=await res.text(), story=page[language];
  assert.equal(res.status,200,path);assert.ok(html.includes(story.title),path);assert.ok(html.includes(story.visionTitle),path);
  assert.ok(html.includes(story.galleryTitle),path);assert.ok(html.includes(story.gallery[0].title),path);
  assert.ok(html.includes(`src="${page.image}"`),path);assert.ok(html.includes(`src="${story.gallery[0].src}"`),path);assert.ok(html.includes(`src="${story.gallery[1].src}"`),path);
  assert.ok(html.includes('index,follow,max-image-preview:large'),path);
  assert.ok(html.includes('property="og:image"'),path);const ld=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];assert.equal(JSON.parse(ld).url,origin+path);
  const target=story.primary.href.startsWith('/')?prefix+story.primary.href:story.primary.href;assert.ok(html.includes(`href="${target.replaceAll('&','&amp;')}"`),path);
 }
 for(const image of new Set(Object.values(pages).flatMap(p=>[p.image,...p.ar.gallery.map(x=>x.src)]))){const res=await response(image);assert.equal(res.status,200,image);assert.match(res.headers.get('content-type'),/^image\/webp/,image);assert.ok(Number(res.headers.get('content-length'))>10000,image)}
 for(const script of ['/experience-content.js','/experience-render.js','/experience-pages.css'])assert.equal((await response(script)).status,200,script);
});

test('sitemap discovers experience cover images and structured data escapes editorial text',async()=>{
 const sitemap=await (await response('/sitemap.xml')).text();assert.match(sitemap,/xmlns:image=/);assert.ok(sitemap.includes(fixture.studio.image));
 published.studio.ar.summary='مساحة </script><script> غير آمن';
 const html=await (await response('/experiences/design')).text();const ld=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
 assert.ok(ld);assert.equal(JSON.parse(ld).description,published.studio.ar.summary);assert.ok(!ld.includes('</script>'));
 published=structuredClone(fixture);
});

test('published content changes appear in HTML and browser module without rebuilding',async()=>{
 published.studio.ar.summary='تحديث مباشر من قاعدة البيانات';
 const html=await (await response('/experiences/design')).text();
 const module=await (await response('/experience-content.js')).text();
 assert.ok(html.includes('تحديث مباشر من قاعدة البيانات'));assert.ok(module.includes('تحديث مباشر من قاعدة البيانات'));
 published=structuredClone(fixture);
});

test('design video is served in browser-friendly byte ranges and retains real calls to action',async()=>{
 const html=await (await response('/experiences/design')).text();
 assert.match(html,/<video controls playsinline preload="none"/);assert.match(html,/biet-al-reef-design-vision-v1\.mp4/);
 const r=await worker.fetch(new Request(origin+'/media/experiences/biet-al-reef-design-vision-v1.mp4',{headers:{Range:'bytes=0-99'}}));
 assert.equal(r.status,206);assert.equal(r.headers.get('content-type'),'video/mp4');assert.equal(r.headers.get('content-length'),'100');assert.equal((await r.arrayBuffer()).byteLength,100);
 const invalid=await worker.fetch(new Request(origin+'/media/experiences/biet-al-reef-design-vision-v1.mp4',{headers:{Range:'bytes=999999999-'}}));assert.equal(invalid.status,416);
});
