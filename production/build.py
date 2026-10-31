from pathlib import Path
import json, hashlib
base=Path(__file__).parent
s=(base/'worker-baseline.mjs').read_text();start=s.index('{');assets,end=json.JSONDecoder().raw_decode(s[start:])
for name in ['index.html','route-bridge.js','vision-market.js','app.js','market-experience.js','market-v3.js','market-v3.css','brx-studio.js','brx-premium.js']:
 assets[name]=(base/'assets'/name).read_text()
# Fingerprint changed modules so a browser cannot combine new HTML with old routing code.
for name in ['route-bridge.js','vision-market.js','app.js','market-experience.js','market-v3.js','brx-studio.js','brx-premium.js']:
 version=hashlib.sha256(assets[name].encode()).hexdigest()[:12]
 assets['index.html']=assets['index.html'].replace('src=\"/'+name+'\"','src=\"/'+name+'?v='+version+'\"')
s=s[:start]+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+s[start+end:]
needle="if(url.pathname==='/favicon.ico'"
assert needle in s
inject='''if(liveHost && /^\\/(?:en\\/)?(?:experiences\\/(?:design|stores|contracting-services|partnerships)|studio|categories(?:\\/(?:furniture|decor|kitchen|maintenance|garden|construction))?|search|cart|listing|store|how-to-buy|how-it-works|sitemap|(?:guides|business|policies)\\/[a-z0-9-]+)\\/?$/.test(url.pathname)) {
 if(url.pathname.endsWith('/'))return Response.redirect('https://app.bietalreef.ae'+url.pathname.replace(/\/+$/,'')+url.search,301);
 const en=url.pathname.startsWith('/en/');
 const slug=url.pathname.replace(/^\\/en/, '').replace(/\\/$/,'');
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
 const title=en?(translatedOwner?.[0]||translatedLegal?.[0]||data[1]):data[0], desc=en?(translatedOwner?.[1]||data[3]):data[2], canonical='https://app.bietalreef.ae'+(en?'/en':'')+slug;
 let page=ASSETS['index.html'].replace('<html lang="ar" dir="rtl">',`<html lang="${en?'en':'ar'}" dir="${en?'ltr':'rtl'}">`)
 .replace(/<title>[^<]*<\\/title>/,`<title>${BR_ESC(title)} | ${en?'Biet Al Reef Marketplace':'سوق بيت الريف'}</title>`)
 .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${BR_ESC(desc)}">`)
 .replace(/<meta name="robots" content="[^"]*">/,`<meta name="robots" content="${['/search','/cart','/listing','/store'].includes(slug)?'noindex,follow':'index,follow,max-image-preview:large'}">`)
 .replace('</head>',`<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="ar-AE" href="https://app.bietalreef.ae${slug}"><link rel="alternate" hreflang="en-AE" href="https://app.bietalreef.ae/en${slug}"></head>`)
 .replace('<main id="content" tabindex="-1"></main>',`<main id="content" tabindex="-1"><div class="wrap nv-site"><nav class="nv-crumb"><a href="${en?'/en/':'/'}">${en?'Home':'الرئيسية'}</a></nav><section class="nv-subhero"><div><h1>${BR_ESC(title)}</h1><p>${BR_ESC(desc)}</p>${d?.arItems?'<ul>'+(en?(d.enItems||[]):d.arItems).map(x=>'<li>'+BR_ESC(x)+'</li>').join('')+'</ul>':''}${!en&&d?.sections?d.sections.map(x=>'<section><h2>'+BR_ESC(x.title)+'</h2>'+(x.paragraphs||[]).map(p=>'<p>'+BR_ESC(p)+'</p>').join('')+(x.items?'<ul>'+x.items.map(v=>'<li>'+BR_ESC(v)+'</li>').join('')+'</ul>':'')+'</section>').join(''):''}${en&&translatedLegal?translatedLegal[1].map(x=>'<section><h2>'+BR_ESC(x[0])+'</h2><p>'+BR_ESC(x[1])+'</p></section>').join(''):''}${slug==='/sitemap'?'<nav>'+BR_PUBLIC_PATHS.filter(x=>x!=='/google-workspace-offer'||!en).map(x=>'<a href=\"'+(en?(x==='/'?'/en/':'/en'+x):x)+'\">'+BR_ESC(x)+'</a> ').join('')+'</nav>':''}${slug==='/categories'?'<nav>'+['furniture','decor','kitchen','maintenance','garden','construction'].map(x=>'<a href=\"'+(en?'/en':'')+'/categories/'+x+'\">'+BR_ESC(x)+'</a> ').join('')+'</nav>':''}${slug==='/experiences/design'?`<a class="nv-button primary" href="${en?'/en':''}/studio">${en?'Open design studio':'افتح الاستوديو'}</a>`:''}</div></section></div></main>`);
 return new Response(request.method==='HEAD'?null:BR_REWRITE_LINKS(page,en),{status:200,headers:{...H,'Content-Type':'text/html; charset=utf-8','Cache-Control':'public,max-age=60','Content-Security-Policy':BR_CSP}});
}
'''

english_home='''if(liveHost&&url.pathname==='/index.html')return Response.redirect('https://app.bietalreef.ae/'+url.search,301);
if(liveHost&&url.pathname==='/en')return Response.redirect('https://app.bietalreef.ae/en/'+url.search,301);
if(liveHost && url.pathname==='/en/') {
 let page=ASSETS['index.html'].replace('<html lang="ar" dir="rtl">','<html lang="en" dir="ltr">').replace(/<title>[^<]*<\/title>/,'<title>Biet Al Reef Marketplace | Design and Services</title>').replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Explore Biet Al Reef marketplace, design studio and business services in the UAE.">').replace('</head>','<link rel="canonical" href="https://app.bietalreef.ae/en/"><link rel="alternate" hreflang="ar-AE" href="https://app.bietalreef.ae/"><link rel="alternate" hreflang="en-AE" href="https://app.bietalreef.ae/en/"></head>').replace('<main id="content" tabindex="-1"></main>','<main id="content" tabindex="-1"><div class="wrap"><h1>Biet Al Reef Marketplace</h1><p>Discover design, stores, services and partnerships.</p><nav><a href="/en/experiences/design">The Future of Design</a><a href="/en/experiences/stores">The Future of Stores</a><a href="/en/experiences/contracting-services">The Future of Contracting and Services</a><a href="/en/experiences/partnerships">The Future of Partnership</a></nav></div></main>');
 return new Response(request.method==='HEAD'?null:BR_REWRITE_LINKS(page,true),{status:200,headers:{...H,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':BR_CSP}});
}
'''
routecode=(base/'route-map.mjs').read_text().replace('export function ','function ')
documents=(base/'documents.json').read_text()
helpers="const BR_CSP=\"default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; form-action 'self'\";\n"+routecode+'\nconst BR_DOCS='+documents+';\n'+"const BR_PUBLIC_PATHS=['/','/studio','/categories',...['furniture','decor','kitchen','maintenance','garden','construction'].map(x=>'/categories/'+x),'/experiences/design','/experiences/stores','/experiences/contracting-services','/experiences/partnerships','/how-to-buy','/how-it-works','/sitemap',...Object.keys(BR_DOCS.infoDocuments).filter(x=>x!=='how-to-buy').map(x=>'/guides/'+x),...Object.keys(BR_DOCS.ownerTopics).map(x=>'/business/'+x),...Object.keys(BR_DOCS.legalDocuments).map(x=>'/policies/'+x),'/google-workspace-offer'];\n"+"function BR_REWRITE_LINKS(html,en){return html.replace(/href=\"(#[^\"]+)\"/g,(full,h)=>{let target=fromLegacy(h.replace(/&amp;/g,'&'));if(!target)return full;let path=(en?(target==='/'?'/en/':'/en'+target):target).replace(/&/g,'&amp;');return 'href=\"'+path+'\" data-market-legacy=\"'+h+'\"'});}\n"
s=s.replace("const MIME={",helpers+"const MIME={",1);
s=s.replace("const MIME={","const BR_ESC=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst MIME={",1);

# Build a sitemap from supported, indexable routes and their actual language availability.
old_start=s.index("if(liveHost&&url.pathname==='/sitemap.xml')")
old_end=s.index('\n',old_start)
sitemap="""if(liveHost&&url.pathname==='/sitemap.xml'){const paths=BR_PUBLIC_PATHS.flatMap(p=>p==='/google-workspace-offer'?[p]:[p,p==='/'?'/en/':'/en'+p]);const xml='<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">'+paths.map(p=>'<url><loc>https://app.bietalreef.ae'+p+'</loc></url>').join('')+'</urlset>';return new Response(request.method==='HEAD'?null:xml,{status:200,headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});}"""
s=s[:old_start]+sitemap+s[old_end:]
# Give the original Arabic home a useful, linked HTML body before the interactive app loads.
home="""<main id=\"content\" tabindex=\"-1\"><div class=\"wrap\"><h1>سوق بيت الريف: التصميم والمتاجر والخدمات</h1><p>اكتشف التصميم والأثاث والخدمات وفرص الشراكة في الإمارات.</p><nav><a href=\"/experiences/design\">مستقبل التصميم</a> <a href=\"/experiences/stores\">مستقبل المتاجر</a> <a href=\"/experiences/contracting-services\">مستقبل المقاولات والخدمات</a> <a href=\"/experiences/partnerships\">مستقبل الشراكة</a> <a href=\"/categories\">أقسام السوق</a></nav></div></main>"""
s=s.replace("let body=ASSETS[path];","let body=ASSETS[path]; if(liveHost&&path==='index.html')body=body.replace('<main id=\"content\" tabindex=\"-1\"></main>',"+json.dumps(home,ensure_ascii=False)+");",1)
s=s.replace("+ '<link rel=\"canonical\" href=\"https://app.bietalreef.ae/\">\\n</head>'", "+ '<link rel=\"canonical\" href=\"https://app.bietalreef.ae/\"><link rel=\"alternate\" hreflang=\"ar-AE\" href=\"https://app.bietalreef.ae/\"><link rel=\"alternate\" hreflang=\"en-AE\" href=\"https://app.bietalreef.ae/en/\">\\n</head>'")

s=s.replace(needle,english_home+inject+needle,1);
s=s.replace("return new Response(request.method==='HEAD'?null:body,{status:200,headers});","return new Response(request.method==='HEAD'?null:(path==='index.html'?BR_REWRITE_LINKS(body.replace('<meta name=\"robots\" content=\"index,follow,max-image-preview:large\">',''),false):body),{status:200,headers});",1);(base/'dist').mkdir(exist_ok=True); (base/'dist/worker.mjs').write_text(s)
