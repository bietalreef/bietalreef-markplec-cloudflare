// Shared, server-rendered public presentation. The data source enforces publication and plan access.
function BR_MARKET_TEXT(value,en,fallback=''){
 const x=String(value||'').trim();
 return x&&(!en||!/[\u0600-\u06ff]/.test(x))?x:fallback;
}
function BR_MARKET_URL(value){
 if(typeof value!=='string'||value.length>2048)return '';
 if(value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\'))return value;
 try {const u=new URL(value);return u.protocol==='https:'?u.href:''}catch{return ''}
}
function BR_MARKET_SEGMENT(value){const x=String(value||'');return /^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(x)?x:''}
function BR_MARKET_IMAGE(value,alt,cls=''){
 const src=BR_MARKET_URL(value);return src?'<img class="'+cls+'" src="'+BR_ESC(src)+'" alt="'+BR_ESC(alt)+'" '+(/merchant-cover-image|merchant-feature/.test(cls)?'loading="eager" fetchpriority="high"':'loading="lazy"')+' decoding="async">':'';
}
function BR_MARKET_PRICE(item,en){
 const mode=String(item.price_mode||'');const val=Number(item.price??item.price_from);const currency=String(item.currency||'AED');
 if(mode==='quote_required'||mode==='quote'||!Number.isFinite(val)||val<=0||!/^[A-Z]{3}$/.test(currency))return en?'Request a quote':'اطلب عرض سعر';
 const formatted=new Intl.NumberFormat(en?'en-AE':'ar-AE',{style:'currency',currency,maximumFractionDigits:2}).format(val);
 const detail=item.details||item.specifications||{};const unit=BR_MARKET_TEXT(en?detail.price_unit_en:detail.price_unit_ar,en,'');
 return (mode==='from'?(en?'From ':'يبدأ من ')+formatted:formatted)+(unit?' '+unit:'');
}
function BR_MARKET_CONTACT(profile,en){
 const digits=String(profile.whatsapp||'').replace(/\D/g,'').replace(/^00/,'');
 if(digits.length>=9&&digits.length<=15)return '<a class="merchant-button merchant-primary" href="https://wa.me/'+digits+'" target="_blank" rel="noopener noreferrer">'+(en?'Contact the store':'تواصل مع المتجر')+' ↗</a>';
 const phone=String(profile.phone||'').replace(/[^\d+]/g,'');
 if(/^\+?[\d]{7,16}$/.test(phone))return '<a class="merchant-button merchant-primary" href="tel:'+BR_ESC(phone)+'">'+(en?'Call the store':'اتصل بالمتجر')+' ↗</a>';
 return '';
}
function BR_RENDER_STORE(data,en){
 const p=data.profile||{},items=Array.isArray(data.items)?data.items:[],prefix=en?'/en':'',name=BR_MARKET_TEXT(en?p.nameEn:p.nameAr,en,en?'Store':'متجر');
 const tagline=BR_MARKET_TEXT(en?p.taglineEn:p.taglineAr,en,en?'Explore the store and its selection.':'اكتشف المتجر وما يقدمه من منتجات وخدمات.');
 const description=BR_MARKET_TEXT(en?p.aboutEn||p.descriptionEn:p.aboutAr||p.descriptionAr,en,en?'Explore the store and its selection.':'تعرّف على المتجر وما يقدمه من منتجات وخدمات.');
 const groups=[['product',en?'Products':'المنتجات'],['service',en?'Services':'الخدمات'],['offer',en?'Offers':'العروض'],['project',en?'Projects':'الأعمال والمشاريع']].map(([key,label])=>({key,label,items:items.filter(x=>x.entity_type===key)})).filter(g=>g.items.length);
 const cover=BR_MARKET_URL(p.cover),logo=BR_MARKET_URL(p.logo),contact=BR_MARKET_CONTACT(p,en);
 const chars=Array.from(description),short=chars.length>150?chars.slice(0,150).join('').trim():description,more=chars.length>150?chars.slice(150).join('').trim():'';
 const cards=g=>g.items.map(x=>{const title=BR_MARKET_TEXT(en?x.title_en:x.title_ar,en,en?'Product':'منتج'),desc=BR_MARKET_TEXT(en?x.description_en:x.description_ar,en,''),key=BR_MARKET_SEGMENT(x.route_key||x.public_id||x.entity_id),href=g.key==='product'&&key?prefix+'/product/'+encodeURIComponent(key):'';
  const content=BR_MARKET_IMAGE(x.image_url,title,'merchant-card-image')+'<div class="merchant-card-copy"><h3>'+BR_ESC(title)+'</h3>'+(desc?'<p>'+BR_ESC(desc)+'</p>':'')+(g.key==='product'?'<strong>'+BR_ESC(BR_MARKET_PRICE(x,en))+'</strong>':'')+(href?'<span>'+(en?'View details':'عرض التفاصيل')+' ↗</span>':'')+'</div>';
  return href?'<a class="merchant-card" href="'+href+'">'+content+'</a>':'<article class="merchant-card">'+content+'</article>';
 }).join('');
 const products=groups.find(g=>g.key==='product');
 const models=['wooden-kitchen','wooden-wardrobe','wooden-door'];
 const studioItems=data.studio_allowed===true&&products?products.items.filter(x=>models.includes(x.studio_model)&&BR_MARKET_SEGMENT(x.route_key)).map(x=>({id:BR_MARKET_SEGMENT(x.route_key),model:x.studio_model,ar:BR_MARKET_TEXT(x.title_ar,false,'منتج'),en:BR_MARKET_TEXT(x.title_en,true,'Product'),image:BR_MARKET_URL(x.image_url),href:prefix+'/product/'+encodeURIComponent(x.route_key)})):[];
 const hasStudio=studioItems.length>0,selected=hasStudio?'design':(groups[0]?.key||'about');
 const tabs=(hasStudio?'<button type="button" data-merchant-tab="design" aria-pressed="true">'+(en?'Design':'التصميم')+'</button>':'')+groups.map(g=>'<button type="button" data-merchant-tab="'+g.key+'" aria-pressed="'+String(g.key===selected)+'">'+g.label+'</button>').join('');
 const wa=String(p.whatsapp||'').replace(/\D/g,'').replace(/^00/,'');
 const code=String(p.canonicalProviderCode||p.providerId||'');
 const config=JSON.stringify({slug:BR_MARKET_SEGMENT(p.slug),name,items:studioItems,whatsapp:p.quoteEnabled===true&&wa.length>=9&&wa.length<=15?wa:'',appUrl:/^BR-[0-9]{7,12}$/.test(code)?'https://providers.bietalreef.ae/provider/'+code:''}).replace(/</g,'\\u003c');
 const design=hasStudio?'<section class="merchant-design" data-merchant-panel="design"><div data-merchant-studio-mount><h2>'+(en?'Design with this store':'صمّم مع المتجر')+'</h2><p>'+(en?'Loading the interactive studio…':'جارٍ تجهيز استوديو التصميم…')+'</p></div><script type="application/json" id="brx-merchant-data">'+config+'</script></section>':'';
 return '<div class="merchant-page wrap" data-nv-page="public-store" data-merchant-ssr data-merchant-kind="store"><nav class="merchant-crumb"><a href="'+(en?'/en/':'/')+'">'+(en?'Home':'الرئيسية')+'</a> / '+(en?'Store':'المتجر')+'</nav><header class="merchant-hero">'+(cover?'<div class="merchant-cover">'+BR_MARKET_IMAGE(cover,'','merchant-cover-image')+'</div>':'')+'<div class="merchant-identity">'+(logo?BR_MARKET_IMAGE(logo,name,'merchant-logo'):'')+'<div><small>'+(en?'BIET AL REEF MARKETPLACE':'سوق بيت الريف')+'</small><h1>'+BR_ESC(name)+'</h1><p>'+BR_ESC(tagline)+'</p><div class="merchant-actions">'+contact+'</div></div></div></header><nav class="merchant-tabs" aria-label="'+(en?'Store sections':'أقسام المتجر')+'">'+tabs+'<button type="button" data-merchant-tab="about" aria-pressed="'+String(selected==='about')+'">'+(en?'About':'عن المتجر')+'</button></nav>'+design+groups.map(g=>'<section class="merchant-collection" data-merchant-panel="'+g.key+'"'+(g.key===selected?'':' hidden')+'><div class="merchant-heading"><h2>'+g.label+'</h2><span>'+g.items.length+'</span></div><div class="merchant-grid">'+cards(g)+'</div></section>').join('')+'<section class="merchant-about" data-merchant-panel="about"'+(selected==='about'?'':' hidden')+'><h2>'+(en?'About the store':'عن المتجر')+'</h2><p>'+BR_ESC(short)+(more?'…':'')+'</p>'+(more?'<details><summary>'+(en?'More':'المزيد')+'</summary><p>'+BR_ESC(more)+'</p></details>':'')+'</section></div>';
}
function BR_RENDER_PRODUCT(data,en){
 const p=data.product||{},s=data.store_profile||{},prefix=en?'/en':'',name=BR_MARKET_TEXT(en?p.name_en:p.name_ar,en,en?'Product':'منتج'),store=BR_MARKET_TEXT(en?s.nameEn:s.nameAr,en,en?'Store':'المتجر'),description=BR_MARKET_TEXT(en?p.description_en:p.description_ar,en,''),slug=BR_MARKET_SEGMENT(s.slug),cover=BR_MARKET_URL(p.image_url),gallery=Array.isArray(p.gallery)?p.gallery:[];
 const photos=[cover,...gallery.map(x=>typeof x==='string'?BR_MARKET_URL(x):BR_MARKET_URL(x?.url))].filter((x,i,a)=>x&&a.indexOf(x)===i);
 const photo=photos.length?'<div class="merchant-product-gallery">'+photos.map((src,i)=>BR_MARKET_IMAGE(src,name+(photos.length>1?' '+(i+1):''),'merchant-product-image'+(i===0?' merchant-feature':''))).join('')+'</div>':'';
 return '<div class="merchant-page wrap" data-nv-page="public-product" data-merchant-ssr data-merchant-kind="product"><nav class="merchant-crumb"><a href="'+(en?'/en/':'/')+'">'+(en?'Home':'الرئيسية')+'</a>'+(slug?' / <a href="'+prefix+'/stores/'+encodeURIComponent(slug)+'">'+BR_ESC(store)+'</a>':'')+' / '+BR_ESC(name)+'</nav><article class="merchant-product">'+photo+'<div class="merchant-product-info"><small>'+BR_ESC(store)+'</small><h1>'+BR_ESC(name)+'</h1><p class="merchant-product-price">'+BR_ESC(BR_MARKET_PRICE(p,en))+'</p>'+(description?'<details class="merchant-product-details" open><summary>'+(en?'Product details':'تفاصيل المنتج')+'</summary><p>'+BR_ESC(description)+'</p></details>':'')+'<div class="merchant-actions">'+BR_MARKET_CONTACT(s,en)+(slug?'<a class="merchant-button merchant-secondary" href="'+prefix+'/stores/'+encodeURIComponent(slug)+'">'+(en?'Visit store':'زيارة المتجر')+' ↗</a>':'')+'</div></div></article></div>';
}
function BR_MARKET_SEO(data,kind,en,canonical){
 const p=kind==='store'?data.profile:data.product, name=kind==='store'?BR_MARKET_TEXT(en?p.nameEn:p.nameAr,en,en?'Store':'متجر'):BR_MARKET_TEXT(en?p.name_en:p.name_ar,en,en?'Product':'منتج'),desc=kind==='store'?BR_MARKET_TEXT(en?p.descriptionEn:p.descriptionAr,en,''):BR_MARKET_TEXT(en?p.description_en:p.description_ar,en,''),img=BR_MARKET_URL(kind==='store'?p.cover:p.image_url);
 const schema={'@context':'https://schema.org','@type':kind==='store'?'Store':'Product',name,url:canonical};if(desc)schema.description=desc;if(img)schema.image=img.startsWith('/')?'https://app.bietalreef.ae'+img:img;
 if(kind==='product'&&p.sku)schema.sku=String(p.sku);
 if(kind==='product'&&p.checkout_enabled===true&&p.price_mode==='fixed'&&Number(p.price)>0&&/^[A-Z]{3}$/.test(String(p.currency||''))&&['in_stock','out_of_stock'].includes(p.stock_status))schema.offers={'@type':'Offer',url:canonical,price:Number(p.price),priceCurrency:p.currency,availability:'https://schema.org/'+(p.stock_status==='in_stock'?'InStock':'OutOfStock')};
 return '<meta property="og:type" content="website"><meta property="og:title" content="'+BR_ESC(name)+'"><meta property="og:description" content="'+BR_ESC(desc)+'"><meta property="og:url" content="'+BR_ESC(canonical)+'">'+(img?'<meta property="og:image" content="'+BR_ESC(img.startsWith('/')?'https://app.bietalreef.ae'+img:img)+'">':'')+'<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>';
}
async function BR_LOAD_MARKET_PAGE(kind,key){
 const fn=kind==='store'?'get_public_market_store_page':'get_public_market_product_page',body=kind==='store'?{p_slug:key}:{p_key:key};
 try{const res=await fetch(MARKET_TAXONOMY_PROJECT+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:MARKET_TAXONOMY_PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(6000)});if(!res.ok)return {error:true};const data=await res.json();if(!data||data.ok!==true)return {missing:true};if(kind==='store'&&(!data.profile||!Array.isArray(data.items)))return {error:true};if(kind==='product'&&(!data.product||!data.store_profile))return {error:true};return {data}}catch{return {error:true}}
}
