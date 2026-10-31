from pathlib import Path
import json, hashlib, base64
base=Path(__file__).parent
s=(base/'worker-baseline.mjs').read_text();start=s.index('{');assets,end=json.JSONDecoder().raw_decode(s[start:])
for name in ['index.html','route-bridge.js','vision-market.js','app.js','market-experience.js','market-v3.js','market-v3.css','brx-studio.js','brx-premium.js','experience-pages.css']:
 assets[name]=(base/'assets'/name).read_text()
experience_renderer=(base/'experience-render.mjs').read_text()
assets['experience-render.js']=experience_renderer
for name in ['experience-render.js']:
 version=hashlib.sha256(assets[name].encode()).hexdigest()[:12]
 assets['vision-market.js']=assets['vision-market.js'].replace('./'+name, './'+name+'?v='+version)
for path in (base/'media'/'experiences').iterdir():
 if path.suffix in ('.webp','.mp4'):
  assets['xp/'+path.name]=base64.b64encode(path.read_bytes()).decode()
# Fingerprint changed modules so a browser cannot combine new HTML with old routing code.
for name in ['route-bridge.js','vision-market.js','app.js','market-experience.js','market-v3.js','brx-studio.js','brx-premium.js']:
 version=hashlib.sha256(assets[name].encode()).hexdigest()[:12]
 assets['index.html']=assets['index.html'].replace('src=\"/'+name+'\"','src=\"/'+name+'?v='+version+'\"')
version=hashlib.sha256(assets['experience-pages.css'].encode()).hexdigest()[:12]
assets['index.html']=assets['index.html'].replace('href="/experience-pages.css"','href="/experience-pages.css?v='+version+'"')
s=s[:start]+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+s[start+end:]
needle="if(url.pathname==='/favicon.ico'"
assert needle in s
inject='''if(liveHost && url.pathname==='/experience-content.js') {
 const pages=await BR_LOAD_EXPERIENCES();
 if(!pages)return new Response('Content temporarily unavailable',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Retry-After':'30'}});
 return new Response(request.method==='HEAD'?null:'export const experiencePages='+JSON.stringify(pages).replace(/</g,'\\u003c')+';',{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=30','X-Content-Type-Options':'nosniff'}});
}
if(liveHost && /^\\/media\\/experiences\\/[a-z0-9-]+\\.(?:webp|mp4)$/.test(url.pathname)) {
 const name='xp/'+url.pathname.split('/').pop(),data=ASSETS[name];
 if(!data)return new Response('Not found',{status:404,headers:H});
 const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
 const video=name.endsWith('.mp4'),headers={'Content-Type':video?'video/mp4':'image/webp','Content-Length':String(bytes.length),'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'};
 if(video){headers['Accept-Ranges']='bytes';const range=request.headers.get('range');if(range&&request.method!=='HEAD'){const match=/^bytes=(\\d*)-(\\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{...headers,'Content-Range':'bytes */'+bytes.length,'Content-Length':'0'}});let start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2])),end=match[1]?(match[2]?Number(match[2]):bytes.length-1):bytes.length-1;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=bytes.length||end<start)return new Response(null,{status:416,headers:{...headers,'Content-Range':'bytes */'+bytes.length,'Content-Length':'0'}});end=Math.min(end,bytes.length-1);headers['Content-Range']='bytes '+start+'-'+end+'/'+bytes.length;headers['Content-Length']=String(end-start+1);return new Response(bytes.slice(start,end+1),{status:206,headers});}}
 return new Response(request.method==='HEAD'?null:bytes,{status:200,headers});
}
if(liveHost && /^\\/(?:en\\/)?(?:experiences\\/(?:design|stores|contracting-services|partnerships)|studio|categories(?:\\/(?:furniture|decor|kitchen|maintenance|garden|construction))?|search|cart|listing|store|how-to-buy|how-it-works|sitemap|(?:guides|business|policies)\\/[a-z0-9-]+)\\/?$/.test(url.pathname)) {
 if(url.pathname.endsWith('/'))return Response.redirect('https://app.bietalreef.ae'+url.pathname.replace(/\/+$/,'')+url.search,301);
 const en=url.pathname.startsWith('/en/');
 const slug=url.pathname.replace(/^\\/en/, '').replace(/\\/$/,'');
 const xpPages=slug.startsWith('/experiences/')?await BR_LOAD_EXPERIENCES():null;
 if(slug.startsWith('/experiences/')&&!xpPages)return new Response('Content temporarily unavailable',{status:503,headers:{...H,'Cache-Control':'no-store','Retry-After':'30'}});
 const xp=xpPages?Object.entries(xpPages).find(([,p])=>slug==='/experiences/'+p.slug):null;
 const documents=BR_DOCS; const section=slug.match(/^\/(guides|business|policies)\/([a-z0-9-]+)$/);
 const d=slug==='/how-to-buy'?documents.infoDocuments['how-to-buy']:section?(section[1]==='guides'?documents.infoDocuments[section[2]]:section[1]==='business'?documents.ownerTopics[section[2]]:documents.legalDocuments[section[2]]):null;
 const data={
 '/experiences/design':['مستقبل التصميم','The Future of Design','استكشف استوديو التصميم وجرّب الألوان والخامات وتنسيق الأثاث.','Explore the design studio and try furniture, colours and materials.'],
 '/experiences/stores':['مستقبل المتاجر','The Future of Stores','اكتشف معارض التجار وتجربة عرض المنتجات في مساحات تفاعلية.','Explore merchant showrooms and interactive product displays.'],
 '/experiences/contracting-services':['مستقبل المقاولات والخدمات','The Future of Contracting and Services','اكتشف حلول البناء والتشطيبات والخدمات المناسبة لمشروعك.','Discover construction, finishing and services for your project.'],
 '/experiences/partnerships':['مستقبل الشراكة مع بيت الريف','The Future of Partnership','اكتشف فرص حضور متجرك أو خدماتك على بيت الريف.','Discover opportunities to present your business on Biet Al Reef.'],
 '/how-it-works':['كيف يعمل السوق','How the Marketplace Works','تعرف على البحث واكتشاف المتاجر والخدمات.','Explore how to discover stores and services.'],
 '/sitemap':['دليل السوق','Marketplace Directory','تصفح أقسام ودليل سوق بيت الريف.','Explore the Biet Al Reef marketplace directory.'],
 '/studio':['استوديو التصميم','Design Studio','جرّب تصميم مساحتك واختيار الألوان والخامات.','Explore and arrange your space with colours and materials.'],
 '/categories':['أقسام السوق','Marketplace Categories','استكشف أقسام سوق بيت الريف.','Explore Biet Al Reef marketplace categories.'],
 '/categories/furniture':['أثاث ومعيشة','Furniture and Living','استكشف الأثاث واحتياجات المعيشة.','Explore furniture and living essentials.'],
 '/categories/decor':['ديكور وإضاءة','Decor and Lighting','استكشف الديكور والإضاءة.','Explore decor and lighting.'],
 '/categories/kitchen':['مطابخ وتجهيزات','Kitchens and Equipment','استكشف المطابخ والتجهيزات.','Explore kitchens and equipment.'],
 '/categories/maintenance':['صيانة وخدمات','Maintenance and Services','استكشف خدمات الصيانة.','Explore maintenance services.'],
 '/categories/garden':['حدائق وخارجيات','Gardens and Outdoors','استكشف حلول الحدائق والخارجيات.','Explore gardens and outdoor spaces.'],
 '/categories/construction':['بناء وتشطيبات','Construction and Finishing','استكشف البناء والتشطيبات.','Explore construction and finishing.'],
 '/search':['البحث في السوق','Marketplace Search','ابحث في سوق بيت الريف.','Search the Biet Al Reef marketplace.'],
 '/cart':['سلة المشتريات','Shopping Cart','راجع سلة مشترياتك.','Review your shopping cart.'],
 '/listing':['تفاصيل الاختيارات','Listing Details','استكشف المنتجات والخدمات.','Explore products and services.'],
 '/store':['المتجر','Store','استكشف متاجر بيت الريف.','Explore Biet Al Reef stores.']
 }[slug] || (d ? [d.arTitle||d.title,d.enTitle||d.title,d.arIntro||d.description||d.text,d.enIntro||d.description||d.text] : null);
 if(!data) return new Response('Not found',{status:404});
 const translatedOwner=section?.[1]==='business'?documents.ownersEn?.[section[2]]:null;
 const translatedLegal=section?.[1]==='policies'?documents.legalEn?.[section[2]]:null;
 const title=xp?xp[1][en?'en':'ar'].title:en?(translatedOwner?.[0]||translatedLegal?.[0]||data[1]):data[0], desc=xp?xp[1][en?'en':'ar'].summary:en?(translatedOwner?.[1]||data[3]):data[2], canonical='https://app.bietalreef.ae'+(en?'/en':'')+slug;
 let page=ASSETS['index.html'].replace('<html lang="ar" dir="rtl">',`<html lang="${en?'en':'ar'}" dir="${en?'ltr':'rtl'}">`)
 .replace(/<title>[^<]*<\\/title>/,`<title>${BR_ESC(title)} | ${en?'Biet Al Reef Marketplace':'سوق بيت الريف'}</title>`)
 .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${BR_ESC(desc)}">`)
 .replace(/<meta name="robots" content="[^"]*">/,`<meta name="robots" content="${['/search','/cart','/listing','/store'].includes(slug)?'noindex,follow':'index,follow,max-image-preview:large'}">`)
 .replace('</head>',`<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="ar-AE" href="https://app.bietalreef.ae${slug}"><link rel="alternate" hreflang="en-AE" href="https://app.bietalreef.ae/en${slug}">${xp?BR_EXPERIENCE_SEO(xp[1],en,canonical):''}</head>`)
 .replace('<main id="content" tabindex="-1"></main>',`<main id="content" tabindex="-1">${xp?renderExperience(xp[1],xp[0],xpPages,en):`<div class="wrap nv-site"><nav class="nv-crumb"><a href="${en?'/en/':'/'}">${en?'Home':'الرئيسية'}</a></nav><section class="nv-subhero"><div><h1>${BR_ESC(title)}</h1><p>${BR_ESC(desc)}</p>${d?.arItems?'<ul>'+(en?(d.enItems||[]):d.arItems).map(x=>'<li>'+BR_ESC(x)+'</li>').join('')+'</ul>':''}${!en&&d?.sections?d.sections.map(x=>'<section><h2>'+BR_ESC(x.title)+'</h2>'+(x.paragraphs||[]).map(p=>'<p>'+BR_ESC(p)+'</p>').join('')+(x.items?'<ul>'+x.items.map(v=>'<li>'+BR_ESC(v)+'</li>').join('')+'</ul>':'')+'</section>').join(''):''}${en&&translatedLegal?translatedLegal[1].map(x=>'<section><h2>'+BR_ESC(x[0])+'</h2><p>'+BR_ESC(x[1])+'</p></section>').join(''):''}${slug==='/sitemap'?'<nav>'+BR_PUBLIC_PATHS.filter(x=>x!=='/google-workspace-offer'||!en).map(x=>'<a href=\"'+(en?(x==='/'?'/en/':'/en'+x):x)+'\">'+BR_ESC(x)+'</a> ').join('')+'</nav>':''}${slug==='/categories'?'<nav>'+['furniture','decor','kitchen','maintenance','garden','construction'].map(x=>'<a href=\"'+(en?'/en':'')+'/categories/'+x+'\">'+BR_ESC(x)+'</a> ').join('')+'</nav>':''}</div></section></div>`}</main>`);
 return new Response(request.method==='HEAD'?null:BR_REWRITE_LINKS(page,en),{status:200,headers:{...H,'Content-Type':'text/html; charset=utf-8','Cache-Control':xp?'public,max-age=30':'public,max-age=60','Content-Security-Policy':BR_CSP}});
}
'''

english_home='''if(liveHost&&url.pathname==='/index.html')return Response.redirect('https://app.bietalreef.ae/'+url.search,301);
if(liveHost&&url.pathname==='/en')return Response.redirect('https://app.bietalreef.ae/en/'+url.search,301);
if(liveHost && url.pathname==='/en/') {
 const pages=await BR_LOAD_EXPERIENCES();
 let page=ASSETS['index.html'].replace('<html lang="ar" dir="rtl">','<html lang="en" dir="ltr">').replace(/<title>[^<]*<\/title>/,'<title>Biet Al Reef | Stores and Interactive Showrooms in the UAE</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Discover stores, interactive showrooms, design ideas and services across the UAE on Biet Al Reef Marketplace.">').replace('</head>','<link rel="canonical" href="https://app.bietalreef.ae/en/"><link rel="alternate" hreflang="ar-AE" href="https://app.bietalreef.ae/"><link rel="alternate" hreflang="en-AE" href="https://app.bietalreef.ae/en/"></head>').replace('<main id="content" tabindex="-1"></main>','<main id="content" tabindex="-1">'+BR_HOME_HTML(pages,true)+'</main>');
 return new Response(request.method==='HEAD'?null:BR_REWRITE_LINKS(page,true),{status:200,headers:{...H,'Content-Type':'text/html; charset=utf-8','Cache-Control':'public,max-age=30','Content-Security-Policy':BR_CSP}});
}
'''
routecode=(base/'route-map.mjs').read_text().replace('export function ','function ')
documents=(base/'documents.json').read_text()
helpers="const BR_CSP=\"default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; form-action 'self'\";\n"+routecode+'\nconst BR_DOCS='+documents+';\n'+"const BR_PUBLIC_PATHS=['/','/studio','/categories',...['furniture','decor','kitchen','maintenance','garden','construction'].map(x=>'/categories/'+x),'/experiences/design','/experiences/stores','/experiences/contracting-services','/experiences/partnerships','/how-to-buy','/how-it-works','/sitemap',...Object.keys(BR_DOCS.infoDocuments).filter(x=>x!=='how-to-buy').map(x=>'/guides/'+x),...Object.keys(BR_DOCS.ownerTopics).map(x=>'/business/'+x),...Object.keys(BR_DOCS.legalDocuments).map(x=>'/policies/'+x),'/google-workspace-offer'];\n"+"function BR_REWRITE_LINKS(html,en){return html.replace(/href=\"(#[^\"]+)\"/g,(full,h)=>{let target=fromLegacy(h.replace(/&amp;/g,'&'));if(!target)return full;let path=(en?(target==='/'?'/en/':'/en'+target):target).replace(/&/g,'&amp;');return 'href=\"'+path+'\" data-market-legacy=\"'+h+'\"'});}\n"
helpers+=(base/'experience-source.mjs').read_text()+'\n'+experience_renderer.replace('export function ','function ')+'\n'+(base/'experience-seo.mjs').read_text()+'\n'
helpers+="function BR_HOME_HTML(pages,en){const fallback={studio:{slug:'design',ar:{title:'مستقبل التصميم'},en:{title:'The Future of Design'}},showroom:{slug:'stores',ar:{title:'مستقبل المتاجر'},en:{title:'The Future of Stores'}},projects:{slug:'contracting-services',ar:{title:'مستقبل المقاولات والخدمات'},en:{title:'The Future of Contracting and Services'}},partner:{slug:'partnerships',ar:{title:'مستقبل الشراكة'},en:{title:'The Future of Partnership'}}};const links=Object.values(pages||fallback).map(p=>'<a href=\"'+(en?'/en':'')+'/experiences/'+p.slug+'\">'+BR_ESC(p[en?'en':'ar'].title)+'</a> ').join('');return '<div class=\"wrap\"><h1>'+(en?'Biet Al Reef Marketplace: stores and interactive showrooms':'سوق بيت الريف: المتاجر والمعارض التفاعلية')+'</h1><p>'+(en?'Discover design, stores, services and partnerships in the UAE.':'اكتشف التصميم والمتاجر والخدمات وفرص الشراكة في الإمارات.')+'</p><nav>'+links+'</nav></div>';}\n"
s=s.replace("const MIME={",helpers+"const MIME={",1);
s=s.replace("const MIME={","const BR_ESC=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst MIME={",1);

# Build a sitemap from supported, indexable routes and their actual language availability.
old_start=s.index("if(liveHost&&url.pathname==='/sitemap.xml')")
old_end=s.index('\n',old_start)
sitemap="""if(liveHost&&url.pathname==='/sitemap.xml'){const pages=await BR_LOAD_EXPERIENCES();const paths=BR_PUBLIC_PATHS.flatMap(p=>p==='/google-workspace-offer'?[p]:[p,p==='/'?'/en/':'/en'+p]);const xml='<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">'+paths.map(p=>{const clean=p.startsWith('/en/')?p.slice(3):p,xp=pages&&Object.values(pages).find(x=>clean==='/experiences/'+x.slug),lang=p.startsWith('/en/')?'en':'ar';let extra='';if(xp){if(xp.updatedAt&&!Number.isNaN(Date.parse(xp.updatedAt)))extra+='<lastmod>'+new Date(xp.updatedAt).toISOString()+'</lastmod>';const imgs=[xp.image,...xp[lang].gallery.map(x=>x.src)];for(const src of [...new Set(imgs)])extra+='<image:image><image:loc>'+BR_ESC(src.startsWith('/')?'https://app.bietalreef.ae'+src:src)+'</image:loc></image:image>';}return '<url><loc>https://app.bietalreef.ae'+BR_ESC(p)+'</loc>'+extra+'</url>';}).join('')+'</urlset>';return new Response(request.method==='HEAD'?null:xml,{status:200,headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=60'}});}"""
s=s[:old_start]+sitemap+s[old_end:]
# Give the original Arabic home a useful, linked HTML body before the interactive app loads.
s=s.replace("let body=ASSETS[path];","let body=ASSETS[path]; if(liveHost&&path==='index.html'){const pages=await BR_LOAD_EXPERIENCES();body=body.replace('<main id=\"content\" tabindex=\"-1\"></main>','<main id=\"content\" tabindex=\"-1\">'+BR_HOME_HTML(pages,false)+'</main>');}",1)
s=s.replace("+ '<link rel=\"canonical\" href=\"https://app.bietalreef.ae/\">\\n</head>'", "+ '<link rel=\"canonical\" href=\"https://app.bietalreef.ae/\"><link rel=\"alternate\" hreflang=\"ar-AE\" href=\"https://app.bietalreef.ae/\"><link rel=\"alternate\" hreflang=\"en-AE\" href=\"https://app.bietalreef.ae/en/\">\\n</head>'")

s=s.replace(needle,english_home+inject+needle,1);
s=s.replace("headers['Cache-Control']='public, max-age=300'", "headers['Cache-Control']='public, max-age=30'")
s=s.replace("return new Response(request.method==='HEAD'?null:body,{status:200,headers});","return new Response(request.method==='HEAD'?null:(path==='index.html'?BR_REWRITE_LINKS(body.replace('<meta name=\"robots\" content=\"index,follow,max-image-preview:large\">',''),false):body),{status:200,headers});",1);(base/'dist').mkdir(exist_ok=True); (base/'dist/worker.mjs').write_text(s)
