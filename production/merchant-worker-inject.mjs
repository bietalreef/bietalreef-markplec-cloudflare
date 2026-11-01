if(liveHost&&['/api/public-market-products','/api/public-market-stores'].includes(url.pathname)&&['GET','HEAD'].includes(request.method)){
 try{
  const q=String(url.searchParams.get('q')||'').trim().slice(0,100);
  const fn=url.pathname==='/api/public-market-stores'?'get_public_market_store_feed':'get_public_market_product_feed';
  const upstream=await fetch(MARKET_TAXONOMY_PROJECT+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:MARKET_TAXONOMY_PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_query:q}),signal:AbortSignal.timeout(7000)});
  if(!upstream.ok)throw new Error('Feed unavailable');const data=await upstream.json();if(!data||data.ok!==true||!Array.isArray(data.items))throw new Error('Invalid feed');
  return new Response(request.method==='HEAD'?null:JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public,max-age=15','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response(JSON.stringify({ok:false}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
}
if(liveHost && /^\/(?:en\/)?(?:(?:stores|product)\/[A-Za-z0-9][A-Za-z0-9_-]{0,159}|products\/[a-z0-9][a-z0-9-]{0,119}\/[a-z0-9][a-z0-9-]{0,159})\/?$/.test(url.pathname)){
 const en=url.pathname.startsWith('/en/'),raw=url.pathname.replace(/^\/en/,'').replace(/\/$/,''),parts=raw.split('/').filter(Boolean),kind=parts[0]==='stores'?'store':'product';
 if(url.pathname.endsWith('/'))return Response.redirect('https://app.bietalreef.ae'+url.pathname.replace(/\/+$/,'')+url.search,301);
 const loaded=await BR_LOAD_MARKET_PAGE(parts[0]==='products'?'named-product':kind,parts[1],parts[2]);
 if(loaded.error)return new Response('Temporarily unavailable',{status:503,headers:{...H,'Cache-Control':'no-store','Retry-After':'30'}});
 if(loaded.missing)return new Response('Not found',{status:404,headers:{...H,'Cache-Control':'no-store'}});
 if(parts[0]==='product'){
  const target=BR_MARKET_PRODUCT_PATH(loaded.data.store_profile?.slug,loaded.data.product?.slug,loaded.data.product?.route_key,en);
  if(target&&target!==(en?'/en':'')+raw)return Response.redirect('https://app.bietalreef.ae'+target+url.search,301);
 }
 const item=kind==='store'?loaded.data.profile:loaded.data.product;
 const title=kind==='store'?BR_MARKET_TEXT(en?item.nameEn:item.nameAr,en,en?'Store':'متجر'):BR_MARKET_TEXT(en?item.name_en:item.name_ar,en,en?'Product':'منتج');
 const desc=kind==='store'?BR_MARKET_TEXT(en?item.descriptionEn:item.descriptionAr,en,''):BR_MARKET_TEXT(en?item.description_en:item.description_ar,en,'');
 const canonical='https://app.bietalreef.ae'+(en?'/en':'')+raw;
 let page=ASSETS['index.html'].replace('<html lang="ar" dir="rtl">',`<html lang="${en?'en':'ar'}" dir="${en?'ltr':'rtl'}">`)
 .replace(/<title>[^<]*<\/title>/,`<title>${BR_ESC(title)} | ${en?'Biet Al Reef Marketplace':'سوق بيت الريف'}</title>`)
 .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${BR_ESC(desc||title)}">`)
 .replace('</head>',`<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="ar-AE" href="https://app.bietalreef.ae${raw}"><link rel="alternate" hreflang="en-AE" href="https://app.bietalreef.ae/en${raw}">${BR_MARKET_SEO(loaded.data,kind,en,canonical)}</head>`)
 .replace('<main id="content" tabindex="-1"></main>',`<main id="content" tabindex="-1">${kind==='store'?BR_RENDER_STORE(loaded.data,en):BR_RENDER_PRODUCT(loaded.data,en)}</main>`);
 return new Response(request.method==='HEAD'?null:BR_REWRITE_LINKS(page,en),{status:200,headers:{...H,'Content-Type':'text/html; charset=utf-8','Cache-Control':'public,max-age=0,s-maxage=30,must-revalidate','Content-Security-Policy':BR_CSP}});
}
