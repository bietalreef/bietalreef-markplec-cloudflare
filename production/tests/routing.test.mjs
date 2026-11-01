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
let marketSitemap=[],marketSitemapDown=false;
const realFetch=globalThis.fetch;
let storeData={ok:true,studio_allowed:true,profile:{slug:'test-workshop',nameAr:'متجر الاختبار',nameEn:'Test workshop',taglineAr:'تفاصيل جميلة',taglineEn:'Beautiful details',descriptionAr:'أثاث حسب الطلب',descriptionEn:'Made-to-order furniture',aboutAr:'أثاث حسب الطلب',aboutEn:'Made-to-order furniture',cover:'https://example.com/cover.webp',whatsapp:'+971500000000',quoteEnabled:true,canonicalProviderCode:'BR-2000001'},items:[{entity_type:'product',entity_id:'one',route_key:'wooden-door',studio_model:'wooden-door',title_ar:'باب خشبي',title_en:'Wooden door',description_ar:'تفاصيل الباب',description_en:'Door details',price:800,currency:'AED',price_mode:'from',image_url:'https://example.com/door.webp'},{entity_type:'service',entity_id:'two',title_ar:'تصميم',title_en:'Design'}]};
let productData={ok:true,product:{name_ar:'باب خشبي',name_en:'Wooden door',description_ar:'باب حسب الطلب',description_en:'A made-to-order door',image_url:'https://example.com/door.webp',gallery:['https://example.com/door.webp','https://example.com/detail.webp'],price:800,currency:'AED',price_mode:'from',sku:'SKU-1',stock_status:'made_to_order'},store_profile:storeData.profile};
globalThis.fetch=(input,init)=>{const url=String(input);if(url.includes('/rest/v1/marketplace_experience_pages?'))return Promise.resolve(new Response(JSON.stringify(Object.values(published).map(content=>({slug:content.slug,content}))),{headers:{'content-type':'application/json'}}));if(url.includes('/rest/v1/rpc/get_public_market_store_page'))return Promise.resolve(Response.json(JSON.parse(init.body).p_slug==='test-workshop'?storeData:{ok:false}));if(url.includes('/rest/v1/rpc/get_public_market_product_page'))return Promise.resolve(Response.json(JSON.parse(init.body).p_key==='wooden-door'?productData:{ok:false}));if(url.includes('/rest/v1/rpc/get_public_market_product_feed'))return Promise.resolve(Response.json({ok:true,items:JSON.parse(init.body).p_query==='door'?[storeData.items[0]]:[]}));if(url.includes('/rest/v1/rpc/get_public_market_sitemap'))return Promise.resolve(marketSitemapDown?new Response('',{status:503}):Response.json({ok:true,pages:marketSitemap}));return realFetch(input,init)};

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


test('merchant pages are server-rendered in both languages and reject unpublished records',async()=>{
 for(const [prefix,name,product] of [['','متجر الاختبار','باب خشبي'],['/en','Test workshop','Wooden door']]){
  const path=prefix+'/stores/test-workshop',r=await response(path),html=await r.text();assert.equal(r.status,200);assert.ok(html.includes(name));assert.ok(html.includes(product));assert.ok(html.includes('data-merchant-ssr'));assert.match(html,/data-merchant-tab="design" aria-pressed="true"/);assert.match(html,/data-merchant-panel="design"><div data-merchant-studio-mount/);assert.match(html,/data-merchant-panel="product" hidden/);const config=JSON.parse(html.match(/<script type="application\/json" id="brx-merchant-data">(.*?)<\/script>/)[1]);assert.deepEqual(config.items.map(x=>x.id),['wooden-door']);assert.equal(config.items[0].model,'wooden-door');assert.ok(html.includes('href="'+prefix+'/product/wooden-door"'));assert.ok(html.includes('href="'+origin+path+'"'));assert.match(html,/rel="alternate" hreflang="ar-AE"/);
  const pr=await response(prefix+'/product/wooden-door'),ph=await pr.text();assert.equal(pr.status,200);assert.ok(ph.includes(product));assert.ok(ph.includes('detail.webp'));const ld=JSON.parse(ph.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);assert.equal(ld['@type'],'Product');assert.equal(ld.offers,undefined);
 }
 assert.equal((await response('/stores/unpublished')).status,404);assert.equal((await response('/product/unpublished')).status,404);
});

test('merchant studio respects the plan and excludes unrelated or unsupported models',async()=>{
 storeData.items.push({entity_type:'product',entity_id:'three',route_key:'unmapped',title_ar:'غير مرتبط',title_en:'Unmapped',studio_model:'unknown'});
 let html=await (await response('/stores/test-workshop')).text();let cfg=JSON.parse(html.match(/<script type="application\/json" id="brx-merchant-data">(.*?)<\/script>/)[1]);assert.deepEqual(cfg.items.map(x=>x.id),['wooden-door']);
 storeData.studio_allowed=false;html=await (await response('/stores/test-workshop')).text();assert.ok(!html.includes('data-merchant-tab="design"'));assert.match(html,/data-merchant-tab="product" aria-pressed="true"/);
 storeData.items.pop();storeData.studio_allowed=true;
});

test('merchant quote configuration uses only enabled contact and the real app route',async()=>{
 let html=await (await response('/stores/test-workshop')).text();let cfg=JSON.parse(html.match(/<script type="application\/json" id="brx-merchant-data">(.*?)<\/script>/)[1]);assert.equal(cfg.whatsapp,'971500000000');assert.equal(cfg.appUrl,'https://providers.bietalreef.ae/provider/BR-2000001');
 storeData.profile.quoteEnabled=false;html=await (await response('/stores/test-workshop')).text();cfg=JSON.parse(html.match(/<script type="application\/json" id="brx-merchant-data">(.*?)<\/script>/)[1]);assert.equal(cfg.whatsapp,'');storeData.profile.quoteEnabled=true;
});

test('product structured data does not promise checkout while the public purchase flow is disabled',async()=>{
 productData.product.checkout_enabled=true;productData.product.price_mode='fixed';productData.product.stock_status='in_stock';
 const html=await (await response('/product/wooden-door')).text();const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);assert.equal(schema.offers,undefined);
 productData.product.checkout_enabled=false;productData.product.price_mode='from';productData.product.stock_status='made_to_order';
});

test('public product feed returns current published results without a new build',async()=>{
 let r=await response('/api/public-market-products?q=door');assert.equal(r.status,200);assert.deepEqual((await r.json()).items.map(x=>x.route_key),['wooden-door']);
 r=await response('/api/public-market-products?q=missing');assert.deepEqual((await r.json()).items,[]);
});

test('sitemap updates dynamically for published merchant pages and fails safely on source errors',async()=>{
 marketSitemap=[{path:'/stores/test-workshop',image:'https://example.com/cover.webp',updated_at:'2026-11-01T00:00:00Z'},{path:'/product/wooden-door',image:'https://example.com/door.webp',images:['https://example.com/door.webp','https://example.com/detail.webp',{url:'https://example.com/finish.webp'},'javascript:alert(1)']},{path:'/stores/invalid?redirect=x'}];
 const xml=await (await response('/sitemap.xml')).text();for(const path of ['/stores/test-workshop','/en/stores/test-workshop','/product/wooden-door','/en/product/wooden-door'])assert.ok(xml.includes('<loc>'+origin+path+'</loc>'));for(const src of ['door.webp','detail.webp','finish.webp'])assert.equal(xml.split('https://example.com/'+src).length-1,2);assert.ok(!xml.includes('javascript:alert'));assert.ok(!xml.includes('invalid?redirect'));
 marketSitemap=[];assert.ok(!(await (await response('/sitemap.xml')).text()).includes('/stores/test-workshop'));
 marketSitemapDown=true;assert.equal((await response('/sitemap.xml')).status,503);marketSitemapDown=false;
});

test('marketplace content updates without rebuilding and escapes merchant content',async()=>{
 storeData.profile.nameAr='متجر </script><script>bad';const html=await (await response('/stores/test-workshop')).text();assert.ok(html.includes('&lt;/script&gt;'));const ld=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1];assert.equal(JSON.parse(ld).name,storeData.profile.nameAr);assert.ok(!ld.includes('</script>'));
 storeData.profile.nameAr='متجر الاختبار';storeData.items[0].title_ar='منتج محدث';assert.ok((await (await response('/stores/test-workshop')).text()).includes('منتج محدث'));
 storeData.items[0].title_ar='باب خشبي';
});


test('legacy product aliases redirect to their stable product identity',async()=>{
 productData.product.route_key='SKU-1';
 const r=await response('/product/wooden-door?utm_source=test');
 assert.equal(r.status,301);assert.equal(r.headers.get('location'),origin+'/product/SKU-1?utm_source=test');
 delete productData.product.route_key;
});
