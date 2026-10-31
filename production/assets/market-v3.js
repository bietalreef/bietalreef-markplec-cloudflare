import {categoryPhotos} from './category-photos.js';

const CAT=[
 ['furniture','أثاث ومعيشة','مساحات تتكامل مع ذوقك','furniture','✦'],
 ['decor','ديكور وإضاءة','تفاصيل تمنح المكان روحه','lighting','◈'],
 ['kitchen','مطابخ وتجهيزات','من التخطيط إلى التجهيز','kitchen','▣'],
 ['maintenance','صيانة وخدمات','احتياجات البيت اليومية','maintenance','⚙'],
 ['garden','حدائق وخارجيات','مساحات أجمل في الهواء الطلق','garden','❀'],
 ['construction','بناء وتشطيبات','من الفكرة إلى الإنجاز','construction','⌂']
];
const GROUPS={
 furniture:['aluminium-glass-wood','factories-workshops-stores'],
 decor:['aluminium-glass-wood','maintenance-finishing','building-materials-supply'],
 kitchen:['aluminium-glass-wood','building-materials-supply'],
 maintenance:['maintenance-finishing','cleaning-operations-equipment'],
 garden:['construction-contracting','maintenance-finishing'],
 construction:['building-materials-supply','construction-contracting','maintenance-finishing','aluminium-glass-wood']
};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const playLogo='<svg class="br-brand-svg" viewBox="0 0 32 32" aria-hidden="true"><path fill="#29ba67" d="M5 2.5L19 16 5 29.5z"/><path fill="#4285f4" d="M5 2.5L23.7 12.4 19 16z"/><path fill="#fbbc04" d="M23.7 12.4L29 15.3c.8.5.8 1 0 1.5l-5.3 3L19 16z"/><path fill="#ea4335" d="M5 29.5L19 16l4.7 3.8z"/></svg>';
const chromeLogo='<svg class="br-brand-svg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#fbbc04"/><path d="M16 1a15 15 0 0 1 12.99 7.5H16a7.5 7.5 0 0 0-6.49 3.75L4.6 3.85A14.8 14.8 0 0 1 16 1" fill="#ea4335"/><path d="M3.03 8.5 9.53 19.7 16 31A15 15 0 0 1 3.03 8.5" fill="#34a853"/><circle cx="16" cy="16" r="8.25" fill="#fff"/><circle cx="16" cy="16" r="6.65" fill="#4285f4"/></svg>';
const bagIcon='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h16l-1.3 12H5.3L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY='br-guest-cart-v1';
let cart=[],taxonomy=null,studioParts=new Set(['sofa','table']),lastRoute='';
try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');cart=Array.isArray(x)?x.filter(y=>uuid.test(y.id)&&Number.isInteger(y.quantity)&&y.quantity>0&&y.price>0&&y.currency==='AED'&&uuid.test(y.provider_id)).slice(0,20):[]}catch{}
function saveCart(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch{};updateCount();}
function updateCount(){const n=cart.reduce((s,x)=>s+x.quantity,0);document.querySelectorAll('[data-br-cart-count]').forEach(x=>{x.textContent=n;x.setAttribute('aria-label',n+' منتجات في السلة')});}
window.BietAlreefGuestCart=Object.freeze({
 add(product){if(!product||!uuid.test(product.id)||!uuid.test(product.provider_id)||cart.some(x=>x.provider_id!==product.provider_id)||product.published!==true||product.checkout_enabled!==true||product.currency!=='AED'||!Number.isFinite(product.price)||product.price<=0)return false;const existing=cart.find(x=>x.id===product.id);if(existing)existing.quantity=Math.min(99,existing.quantity+1);else if(cart.length<20)cart.push({id:product.id,provider_id:product.provider_id,quantity:1,name:String(product.name||'منتج').slice(0,140),price:product.price,currency:'AED',image_url:typeof product.image_url==='string'&&product.image_url.startsWith('https://')?product.image_url:''});saveCart();return true},
 count(){return cart.reduce((s,x)=>s+x.quantity,0)},
 items(){return cart.map(x=>({...x}))}
});
function navClass(){document.body.classList.toggle('br-in-section',window.marketLocation.hash.startsWith('#section?'));document.body.classList.toggle('br-on-cart',window.marketLocation.hash==='#cart');}
function sectionItems(cat){const seen=new Set();return (taxonomy||[]).filter(x=>GROUPS[cat]?.includes(x.key)).flatMap(g=>(g.specialties||[]).map(s=>({name:s.name_ar,key:s.key,group:g.name_ar}))).filter(s=>{if(!s.key||!s.name||seen.has(s.key))return false;seen.add(s.key);return true})}
function renderSection(){
 const cat=new URLSearchParams((window.marketLocation.hash.split('?')[1]||'')).get('category')||'furniture';
 const c=CAT.find(x=>x[0]===cat)||CAT[0],root=document.querySelector('#content');if(!root)return;
 const arr=sectionItems(c[0]);
 root.innerHTML='<div class="wrap br-section-page"><nav class="br-crumb"><a href="#home">الرئيسية</a><span>›</span><a href="#categories">كل الأقسام</a><span>›</span><b>'+esc(c[1])+'</b></nav>'+
 '<section class="br-section-hero"><div class="br-section-hero-copy"><small>سوق بيت الريف / استكشف القسم</small><h1>'+esc(c[1])+'</h1><p>'+esc(c[2])+'، ومن هنا تبدأ رحلة اختيار المنتجات والخدمات والمتاجر المرتبطة باحتياجك.</p><div class="br-hero-cta"><a href="#results?category='+c[0]+'">اكتشف النتائج ←</a><a href="#studio">صمّم مساحتك</a></div></div><img src="'+esc(categoryPhotos[c[3]])+'" alt="'+esc(c[1])+'" decoding="async" loading="eager"></section>'+
 '<section class="br-section-content"><div class="br-section-heading"><div><span>تخصصات معتمدة</span><h2>اختر ما تحتاجه في '+esc(c[1])+'</h2><p>التخصصات من شجرة بيت الريف، وليست تصنيفات جديدة.</p></div><span class="br-section-count">'+(taxonomy?arr.length+' تخصص':'جارٍ تحميل التخصصات')+'</span></div>'+
 '<div class="br-section-grid">'+(taxonomy?(arr.length?arr.map((s,i)=>'<a class="br-section-specialty" href="#results?category='+encodeURIComponent(c[0])+'&specialty='+encodeURIComponent(s.key)+'"><div class="br-specialty-symbol" aria-hidden="true">'+esc(['◈','✧','▦','⌂','◉','✦'][i%6])+'</div><div><small>'+esc(s.group)+'</small><strong>'+esc(s.name)+'</strong><span>عرض النتائج ←</span></div></a>').join(''):'<p class="br-none">لا توجد تخصصات نشطة لهذا القسم حاليًا.</p>'):'<p class="br-none">جارٍ تحميل التخصصات المعتمدة…</p>')+'</div></section>'+
 '<section class="br-section-bottom"><div><h2>تبحث عن منتجات أو خدمات منشورة؟</h2><p>استكشف نتائج هذا القسم، وسيظهر المحتوى عندما يعتمد نشره أصحاب الأنشطة.</p></div><a href="#results?category='+c[0]+'">استعرض القسم ←</a></section></div>';
 document.title=c[1]+' | سوق بيت الريف';
}
function money(value){return new Intl.NumberFormat('ar-AE',{style:'currency',currency:'AED'}).format(value)}
function renderCart(){
 const root=document.querySelector('#content');if(!root)return;
 const subtotal=cart.reduce((s,x)=>s+x.price*x.quantity,0);
 root.innerHTML='<div class="wrap br-cart-page"><nav class="br-crumb"><a href="#home">الرئيسية</a><span>›</span><b>السلة</b></nav><div class="br-cart-intro"><div><small>دون تسجيل دخول</small><h1>سلة مشترياتك</h1><p>أضف المنتجات المنشورة المتاحة للشراء ثم راجعها قبل الدفع الآمن.</p></div><span class="br-cart-count">'+cart.length+' منتجات</span></div>'+
 (cart.length?'<div class="br-cart-layout"><section class="br-cart-lines">'+cart.map(x=>'<article class="br-cart-line">'+(x.image_url?'<img src="'+esc(x.image_url)+'" alt="" loading="lazy">':'<span class="br-placeholder">'+bagIcon+'</span>')+'<div class="br-cart-data"><strong>'+esc(x.name)+'</strong><span>'+money(x.price)+'</span><div class="br-cart-quantity"><button data-br-qty="-1" data-product="'+x.id+'" aria-label="إنقاص الكمية">−</button><span>'+x.quantity+'</span><button data-br-qty="1" data-product="'+x.id+'" aria-label="زيادة الكمية">+</button></div></div><button class="br-cart-remove" data-br-remove="'+x.id+'">حذف</button></article>').join('')+'</section><aside class="br-cart-summary"><h2>ملخص السلة</h2><div><span>المجموع الفرعي</span><b>'+money(subtotal)+'</b></div><p>تكلفة التوصيل والرسوم لا تُحتسب إلا من النظام عند إنشاء الطلب.</p><form class="br-guest-form" id="br-checkout-form"><label>الاسم<input name="name" autocomplete="name" required maxlength="120" placeholder="اسم المستلم"></label><label>البريد الإلكتروني<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="example@email.com"></label><label>الهاتف<input name="phone" type="tel" autocomplete="tel" required maxlength="20" placeholder="+9715xxxxxxxx"></label><button type="submit" disabled aria-disabled="true">الدفع عبر Stripe — غير متاح في المعاينة</button><p data-br-payment-status role="status" aria-live="polite"></p></form><small>يعتمد تفعيل الدفع على منتجات منشورة مؤهلة ومراجعة الطلب من الخادم. لا تُنفّذ أي دفعة من نسخة المراجعة.</small></aside></div>':
 '<div class="br-empty-cart"><span>'+bagIcon+'</span><h2>سلتك فارغة حاليًا</h2><p>لم تُنشر بعد منتجات مؤهلة للشراء المباشر. تستطيع استكشاف الأقسام والخدمات دون إنشاء حساب.</p><a href="#categories">استكشف الأقسام ←</a></div>')+
 '<section class="br-cart-security"><span>✓ لا حاجة لتسجيل الدخول للتصفح</span><span>✓ يتحقق الخادم من السعر وتوفر المنتج</span><span>✓ Stripe Checkout عند تفعيل البيع</span></section></div>';
 document.title='سلة المشتريات | بيت الريف';
}
const options={sofa:'أريكة',table:'طاولة',rug:'سجادة',plant:'نبات',lamp:'إضاءة',chair:'كرسي'};
function studioSvg(part){return {sofa:'▰',table:'◉',rug:'▱',plant:'✿',lamp:'✦',chair:'◧'}[part]||'◈'}
function studioPartsHTML(){return [...studioParts].map((part,i)=>'<div class="br-piece br-piece-'+part+'" title="'+options[part]+'"><span>'+studioSvg(part)+'</span><small>'+options[part]+'</small></div>').join('')}
function renderStudio(){
 const root=document.querySelector('#content');if(!root)return;
 root.innerHTML='<div class="wrap br-studio-page"><nav class="br-crumb"><a href="#home">الرئيسية</a><span>›</span><b>صمّم مساحتك</b></nav><header class="br-studio-top"><div><small>وياك · تجربة تصميم تفاعلية</small><h1>صمّم مساحة تشبهك</h1><p>جرّب توزيع قطع الأثاث والديكور في نموذج ثلاثي الأبعاد مبسّط. إنها تجربة أولية للإلهام وليست برنامج قياسات أو مخططات تنفيذية.</p></div><a href="#section?category=furniture">استكشف الأثاث ←</a></header><div class="br-studio-layout"><section class="br-studio-visual"><div class="br-studio-overlay"><span>معاينة تصورية · غير مرتبطة بمنتج للبيع</span><span>الإمارات العربية المتحدة</span></div><div class="br-room-canvas"><div class="br-room-floor"><div class="br-room-wall wall-a"></div><div class="br-room-wall wall-b"></div><div class="br-room-floor-pattern"></div><div class="br-room-parts">'+studioPartsHTML()+'</div></div></div><div class="br-studio-hint">أضف أو احذف العناصر من اللوحة لتتغير المعاينة فورًا.</div></section><aside class="br-studio-controls"><h2>عناصر المساحة</h2><p>انقر على العنصر لإظهاره أو إخفائه.</p><div class="br-studio-items">'+Object.entries(options).map(([id,name])=>'<button class="br-studio-option" data-br-piece="'+id+'" aria-pressed="'+studioParts.has(id)+'"><span class="br-studio-opt-icon">'+studioSvg(id)+'</span><span>'+name+'</span><b>'+(studioParts.has(id)?'✓':'＋')+'</b></button>').join('')+'</div><button type="button" class="br-studio-reset" data-br-studio-reset>إعادة التعيين</button><p class="br-studio-note">المنتجات والأسعار الفعلية ستأتي من المتاجر المنشورة والمعتمدة، ولن تُضاف عناصر المعاينة إلى السلة.</p></aside></div></div>';
 document.title='صمّم مساحتك | سوق بيت الريف';
}
function installHeader(){
 const original=document.querySelector('.header .business-link');if(original)original.remove();
 const brand=document.querySelector('.header .identity');if(brand&&!brand.querySelector('.br-cart-header')){
  const a=document.createElement('a');a.href='#cart';a.className='br-cart-header';a.setAttribute('aria-label','افتح سلة المشتريات');a.innerHTML=bagIcon+'<span data-br-cart-count>0</span>';brand.append(a);
 }
 document.querySelectorAll('a,button').forEach(x=>{if(/تسجيل الدخول|إنشاء حساب/.test(x.textContent||'')&&x.closest('header,#side-menu'))x.remove()});
 const bottom=document.querySelector('#side-menu .drawer-bottom');
 if(bottom&&!bottom.querySelector('.br-business-actions')){
  bottom.innerHTML='<p>لأصحاب الأعمال · إدارة متجرك من تطبيق بيت الريف</p><div class="br-business-actions"><a href="https://play.google.com/store/apps/details?id=ae.bietalreef.app" target="_blank" rel="noopener noreferrer" aria-label="حمّل تطبيق الأعمال من Google Play">'+playLogo+'<span>Google Play<small>تحميل التطبيق</small></span></a><a href="https://providers.bietalreef.ae" target="_blank" rel="noopener noreferrer" aria-label="افتح تطبيق الأعمال في المتصفح">'+chromeLogo+'<span>Google Chrome<small>فتح تطبيق الأعمال</small></span></a></div>';
 }
 updateCount();
}
function heroPromo(){
 const root=document.querySelector('#content');
 if(!root||!(!window.marketLocation.hash||window.marketLocation.hash==='#home'))return;
 root.querySelectorAll('.market-ux-specialties').forEach(x=>x.remove());
 const old=root.querySelector('.br-works-showcase')||[...root.querySelectorAll('.section-head h2')].find(h=>h.textContent?.includes('مساحة لاختياراتك القادمة'))?.closest('section');
 if(!old||old.querySelector('.br-studio-teaser'))return;
 old.className='br-studio-teaser';
 old.innerHTML='<div class="br-studio-teaser-copy"><small>خدمة التصميم والتخطيط</small><h2>صمّم مساحتك، ثم اختر ما يناسبها</h2><p>جرّب إضافة الأثاث والفرش والديكور إلى مساحة تصورية من بيت الريف قبل تصفح المتاجر والخدمات.</p><a href="#studio">ابدأ التصميم ←</a><span>تجربة تجريبية مستقلة عن شراء المنتجات</span></div><div class="br-studio-teaser-visual"><div class="br-mini-room"><div class="br-mini-sofa"></div><div class="br-mini-table"></div><div class="br-mini-plant">✿</div></div><div class="br-mini-badge">تنسيق أثاث وديكور <b>360°</b></div></div>';
}
function updateLandingLinks(){
 document.querySelectorAll('.room-discovery-card,.category-grid a.category,#footer-guide .footer-guide-links a,#drawer-nav details a').forEach(a=>{
  const href=a.getAttribute('href')||'';
  const match=href.match(/^#results\?category=([a-z-]+)$/);
  if(match&&CAT.some(c=>c[0]===match[1]))a.href='#section?category='+match[1];
 });
}
function renderForRoute(){
 const route=window.marketLocation.hash.split('?')[0];navClass();
 if(route==='#section'){renderSection();return}
 if(route==='#cart'){renderCart();return}
 if(route==='#studio'){return}
 if(route==='#home'||!route||route==='#categories'){updateLandingLinks();heroPromo();}
}
document.addEventListener('click',e=>{
 const card=e.target.closest('.room-discovery-card,.category-grid a.category,#footer-guide .footer-guide-links a,#drawer-nav details a');
 if(card){const h=card.getAttribute('href')||'';const match=h.match(/^#(?:section|results)\?category=([a-z-]+)$/);if(match&&CAT.some(c=>c[0]===match[1])){e.preventDefault();e.stopImmediatePropagation();window.marketLocation.hash='#section?category='+match[1];if(document.querySelector('#side-menu')?.open)document.querySelector('#side-menu').close();if(window.marketLocation.hash==='#section?category='+match[1])renderForRoute();return;}}
 const more=e.target.closest('[data-br-more]');if(more){e.preventDefault();e.stopImmediatePropagation();window.marketLocation.hash='#categories';return}
 const choice=e.target.closest('[data-br-piece]');if(choice){const part=choice.dataset.brPiece;if(studioParts.has(part))studioParts.delete(part);else studioParts.add(part);renderStudio();return}
 if(e.target.closest('[data-br-studio-reset]')){studioParts=new Set(['sofa','table']);renderStudio();return}
 const inc=e.target.closest('[data-br-qty]');if(inc){const x=cart.find(x=>x.id===inc.dataset.product);if(x){x.quantity=Math.max(1,Math.min(99,x.quantity+Number(inc.dataset.brQty)));saveCart();renderCart()}return}
 const del=e.target.closest('[data-br-remove]');if(del){cart=cart.filter(x=>x.id!==del.dataset.brRemove);saveCart();renderCart();return}
},true);
let busy=false;
function syncUI(){if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;installHeader();renderForRoute()})}
const container=document.querySelector('#content');
if(container)new MutationObserver(()=>{const route=window.marketLocation.hash.split('?')[0];if(['#section','#cart'].includes(route)&&container.firstElementChild?.classList.contains(route==='#section'?'br-section-page':route==='#cart'?'br-cart-page':'br-studio-page'))return;syncUI()}).observe(container,{childList:true});
window.addEventListener('hashchange',()=>{syncUI();window.scrollTo({top:0,behavior:'instant'})});
document.addEventListener('DOMContentLoaded',syncUI,{once:true});
syncUI();
fetch('/api/public-market-taxonomy',{credentials:'omit',signal:AbortSignal.timeout(10000)}).then(r=>r.ok?r.json():null).then(data=>{if(data?.ok&&Array.isArray(data.groups)){taxonomy=data.groups;if(window.marketLocation.hash.startsWith('#section'))renderSection()}}).catch(()=>{});



document.addEventListener('submit',async event=>{
 if(event.target?.id!=='br-checkout-form')return;
 event.preventDefault();
 if(location.hostname!=='app.bietalreef.ae')return;
 const form=event.target,button=form.querySelector('button[type="submit"]');
 if(!cart.length||!cart.every(x=>uuid.test(x.id)&&uuid.test(x.provider_id)))return;
 const values=new FormData(form),email=String(values.get('email')||'').trim(),phone=String(values.get('phone')||'').trim(),name=String(values.get('name')||'').trim();
 if(!email||!phone){form.reportValidity();return}
 button.disabled=true;button.textContent='جارٍ تجهيز صفحة الدفع…';
 try{
  const input={items:cart.map(x=>({product_id:x.id,quantity:x.quantity})),customer_email:email,customer_phone:phone,customer_name:name};
  const response=await fetch('/api/market-checkout',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json','X-Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(input),signal:AbortSignal.timeout(25000)});
  const data=await response.json();
  if(!response.ok||!data.ok||typeof data.checkout_url!=='string'||!data.checkout_url.startsWith('https://checkout.stripe.com/'))throw Error(data.code||'CHECKOUT_FAILED');
  location.assign(data.checkout_url);
 }catch(error){
  const status=form.querySelector('[data-br-payment-status]');if(status)status.textContent='تعذّر بدء الدفع. لم تُخصم أي مبالغ. راجع توفر المنتجات ثم حاول مجددًا.';
  button.disabled=false;button.textContent='انتقل إلى الدفع الآمن عبر Stripe';
 }
});
