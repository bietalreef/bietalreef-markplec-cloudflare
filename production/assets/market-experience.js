import { categoryPhotos } from './category-photos.js';
/**
 * Marketplace presentation enhancement for the EXISTING Biet Al Reef Worker.
 * Reads only the established, anonymous-read taxonomy RPC via same-origin API.
 * Never writes provider content or changes footer hrefs/indexation.
 */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected=(c,p)=>new URLSearchParams((window.marketLocation.hash.split('?')[1]||'')).get(p)===c;
const grouping={
 furniture:['aluminium-glass-wood','factories-workshops-stores'],
 decor:['aluminium-glass-wood','maintenance-finishing','building-materials-supply'],
 kitchen:['aluminium-glass-wood','building-materials-supply'],
 maintenance:['maintenance-finishing','cleaning-operations-equipment'],
 garden:['construction-contracting','maintenance-finishing'],
 construction:['building-materials-supply','construction-contracting','maintenance-finishing','aluminium-glass-wood']
};
const landing=[
 ['furniture','أثاث ومعيشة'],['decor','ديكور وإضاءة'],['kitchen','مطابخ وتجهيزات'],
 ['maintenance','صيانة وخدمات'],['garden','حدائق وخارجيات'],['construction','بناء وتشطيبات']
];
const ctaHref='https://providers.bietalreef.ae';
let taxonomy=null, running=false, updated=false;
function renderSpecialties(cat){
 if(!taxonomy)return '<p class="market-ux-note">جارٍ تحميل التخصصات المعتمدة…</p>';
 const groups=taxonomy.filter(g=>(grouping[cat]||[]).includes(g.key));
 if(!groups.length)return '<p class="market-ux-note">لا توجد تخصصات معتمدة لهذا القسم حاليًا.</p>';
 return groups.map(g=>'<section class="market-ux-subgroup"><h3>'+esc(g.name_ar)+'</h3><div class="market-ux-subitems">'+
 (g.specialties||[]).map(s=>'<a href="#results?category='+encodeURIComponent(cat)+'&specialty='+encodeURIComponent(s.key)+'" title="'+esc(s.name_ar)+'">'+esc(s.name_ar)+'</a>').join('')+'</div></section>').join('');
}

/* BR_MARKET_VISUAL_RAILS_2026: visual browsing from the established public taxonomy. */

/* One main slider. Specialty lists remain within a single expandable panel. */
function brItems(cat){
 const seen=new Set();
 return (taxonomy||[]).filter(g=>(grouping[cat]||[]).includes(g.key))
  .flatMap(g=>(g.specialties||[]).map(s=>({s,group:g.name_ar})))
  .filter(({s})=>{if(!s?.key||!s?.name_ar||seen.has(s.key))return false;seen.add(s.key);return true;});
}
function brIcon(key){
 const k=String(key||'');
 if(/garden|irrigation|outdoor/.test(k))return '✿';
 if(/ac-|cool|ventil/.test(k))return '❄';
 if(/lighting|electric/.test(k))return '✦';
 if(/kitchen|cabinet|countertop/.test(k))return '▤';
 if(/wood|carpentry|furniture/.test(k))return '▥';
 if(/water|plumb|clean/.test(k))return '◉';
 return '⌂';
}
function brTiles(cat){
 const items=brItems(cat);
 return items.length?items.map(({s,group})=>'<a class="br-tile" href="#results?category='+encodeURIComponent(cat)+'&specialty='+encodeURIComponent(s.key)+'"><span class="br-tile-art" aria-hidden="true">'+brIcon(s.key)+'</span><span class="br-tile-copy"><small>'+esc(group)+'</small><strong>'+esc(s.name_ar)+'</strong><em>اكتشف التخصص ←</em></span></a>').join(''):'<p>لا توجد تخصصات متاحة في هذا القسم حاليًا.</p>';
}
function renderVisualRails(){
 return '<div class="br-more-bar"><button type="button" id="br-more-toggle" data-br-more aria-expanded="false" aria-controls="br-more-content">المزيد — عرض التخصصات <span aria-hidden="true">⌄</span></button></div>'+
 '<div id="br-more-content" class="br-more-content" hidden><div class="br-more-top"><div><small>استكشف التخصصات</small><h2 id="br-current-title">أثاث ومعيشة</h2><p>كل تخصص يفتح نتائج البحث المرتبطة به.</p></div><button type="button" data-br-close>إغلاق ✕</button></div>'+
 '<div class="br-category-tabs" role="group" aria-label="الأقسام الرئيسية">'+landing.map(([id,name],i)=>'<button type="button" class="br-cat-tab'+(i?'':' active')+'" data-br-cat="'+id+'" aria-pressed="'+(!i)+'">'+esc(name)+'</button>').join('')+'</div>'+
 '<div class="br-category-grid" id="br-category-grid">'+brTiles('furniture')+'</div></div>';
}
let brCategory='furniture';
function brShow(cat,scroll){
 const panel=document.querySelector('#br-more-content'),toggle=document.querySelector('#br-more-toggle');
 if(!panel||!toggle)return;
 if(landing.some(([id])=>id===cat))brCategory=cat;
 panel.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.innerHTML='إخفاء التخصصات <span aria-hidden="true">⌃</span>';
 panel.querySelector('#br-current-title').textContent=landing.find(([id])=>id===brCategory)?.[1]||'التخصصات';
 panel.querySelector('#br-category-grid').innerHTML=brTiles(brCategory);
 panel.querySelectorAll('[data-br-cat]').forEach(btn=>{const on=btn.dataset.brCat===brCategory;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));});
 if(scroll)requestAnimationFrame(()=>panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
}
function brHide(){
 const panel=document.querySelector('#br-more-content'),toggle=document.querySelector('#br-more-toggle');
 if(!panel||!toggle)return;
 panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.innerHTML='المزيد — عرض التخصصات <span aria-hidden="true">⌄</span>';
}
function brStripTools(){
 const room=document.querySelector('#content .room-discovery');if(!room||room.querySelector('.br-strip-header'))return;
 const h=document.createElement('div');h.className='br-strip-header';
 h.innerHTML='<div><h2>الأقسام الرئيسية</h2><p>اختر القسم لعرض جميع تخصصاته</p></div><div class="br-strip-controls"><button type="button" data-br-arrow="-1" aria-label="السابق">→</button><button type="button" data-br-arrow="1" aria-label="التالي">←</button></div>';
 room.prepend(h);
}
document.addEventListener('click',e=>{
 const more=e.target.closest('[data-br-more]');
 if(more){const p=document.querySelector('#br-more-content');if(p?.hidden)brShow(brCategory,true);else brHide();return;}
 if(e.target.closest('[data-br-close]')){brHide();document.querySelector('#br-more-toggle')?.focus();return;}
 const cat=e.target.closest('[data-br-cat]');if(cat){brShow(cat.dataset.brCat,false);return;}
 const card=e.target.closest('#content .room-discovery-card');
 if(card&&document.querySelector('#br-more-content')){
  const value=new URLSearchParams((card.getAttribute('href')||'').split('?')[1]||'').get('category');
  if(landing.some(([id])=>id===value)){e.preventDefault();brShow(value,true);return;}
 }
 const arrow=e.target.closest('[data-br-arrow]');
 if(arrow){const track=document.querySelector('#content .room-discovery-track'),first=track?.querySelector('.room-discovery-card');if(track&&first)track.scrollBy({left:-Number(arrow.dataset.brArrow)*(first.getBoundingClientRect().width+12),behavior:'smooth'});}
});

const brGuides={
'about':['بيت الريف مساحة مفتوحة لاكتشاف المنتجات والخدمات والمتاجر في الإمارات.',['حدّد احتياجك','استكشف المتاجر والتخصصات','اختر طريقة الطلب المتاحة']],
'how-it-works':['انتقل من البحث إلى فهم التفاصيل ثم طلب المنتج أو الخدمة المناسبة.',['ابحث بالقسم أو المنطقة','راجع المواصفات والنشاط','اشترِ أو اطلب عرض سعر عند توفره']],
'market-guide':['يساعدك تصنيف السوق في الوصول من القسم الرئيسي إلى التخصص الدقيق.',['اختر القسم','مرّر بطاقات التخصصات','صفّ النتائج بحسب المدينة والنوع']],
'request-quote':['القياسات والصور ونطاق العمل تجعل عرض السعر أكثر وضوحًا.',['اكتب وصف المطلوب وموقعه','أرفق الصور والمقاسات المتوفرة','قارن شروط العرض قبل قبوله']],
'how-to-buy':['ميّز المنتج الجاهز عن العمل المصنوع حسب المقاس قبل الاتفاق.',['راجع السعر والتوفر','اقرأ سياسة المتجر والتسليم','اختر الإجراء المتاح للعنصر']],
'direct-purchase':['الشراء المباشر مناسب للعنصر المتاح بسعر محدد وشروط طلب واضحة.',['حدد المنتج والكمية','راجع التوصيل والاسترجاع','تحقق من السعر النهائي قبل الدفع']],
'secure-payment':['اعتمد فقط وسائل الدفع المفعلة داخل رحلة الطلب الرسمية.',['راجع تفاصيل الطلب','تأكد من قناة الدفع','احتفظ بإثبات العملية']],
'track-order':['تابع حالة الطلب باستخدام بياناته والوسائل التي يتيحها النظام.',['احتفظ برقم الطلب','تابع تحديثات الحالة','تواصل مع المتجر عند الحاجة']],
'contact-provider':['تأكد من تخصص النشاط ومناطق خدمته قبل التواصل معه.',['افتح ملف النشاط','راجع الأعمال والتخصص','ارسل وصف طلبك بوضوح']],
'returns-refunds':['تختلف شروط الاسترجاع باختلاف المنتج والخدمة وطبيعة التفصيل.',['راجع سياسة العنصر','احتفظ بالمستندات','تواصل مع المتجر أو الدعم']],
'order-policy':['يساعد الاتفاق الواضح على المواصفات والمدة في تقليل الخلافات.',['حدد البنود والمقاسات','راجع السعر ووقت التسليم','وثّق التعديلات المتفق عليها']],
'publication-policy':['تظهر العناصر في القنوات العامة بعد استيفاء شروطها والمراجعة.',['أكمل بيانات النشاط','أنشئ العنصر وصنّفه','اختر قنوات النشر وانتظر القرار']],
'provider-verification':['حالة اعتماد النشاط تختلف عن إتاحة عنصر للنشر.',['راجع بيانات المتجر','تحقق من حالته المنشورة','تأكد من ملاءمة تخصصه']],
'report-issue':['شرح المشكلة وإرفاق رقم الطلب يساعد خدمة العملاء في متابعتها.',['حدد الطلب أو النشاط','اشرح المشكلة بوضوح','أرسلها عبر قناة الدعم']],
'report-content-provider':['الإبلاغ يختص بالمحتوى أو المتجر المعني، دون مشاركة بيانات زائدة.',['حدّد رابط المحتوى','وضّح سبب البلاغ','أرسله إلى الدعم']],
'data-protection':['تعرّف على البيانات التي تظهر للعموم وما ينبغي تقديمه أثناء الطلب.',['راجع سياسة الخصوصية','استخدم القنوات الرسمية','تواصل مع الدعم في الاستفسارات']],
'customer-service':['خدمة عملاء بيت الريف دائمًا معك لمساعدتك في تحديد الطريق المناسب.',['حدد استفسارك','جهّز الرابط والمعلومات','تواصل عبر القنوات الرسمية']],
'join':['يبدأ نشاطك من التطبيق الرسمي؛ السوق يعرض ما يُعتمد للنشر.',['أنشئ حساب النشاط','أكمل بيانات التوثيق','جهّز متجرك ومحتواه']],
'profile':['الملف التجاري قاعدة معلومات المتجر والنشاط عبر القنوات.',['أدخل الاسم والوصف والتخصص','حدد مناطق الخدمة','راجع الملف قبل طلب الاعتماد']],
'products':['المنتج يُنشأ مرة واحدة ثم يُتاح للنشر في القنوات المسموح بها.',['اختر التصنيف والتخصص','أدخل الصور والمواصفات والسعر','راجع القنوات وحالة النشر']],
'services':['عرّف العميل بما تشمل الخدمة وبالمعلومات اللازمة لتسعيرها.',['اكتب نطاق الخدمة ومناطقها','حدد التسعير أو طلب السعر','راجع المحتوى وأرسله للنشر']],
'orders':['إدارة الطلبات تبدأ ببيانات واضحة وتستمر بالمستندات والمتابعة.',['راجع متطلبات العميل','جهّز العرض والشروط','تابع القرار والتنفيذ']],
'publication':['النشر من التطبيق إلى السوق والمنصة يخضع للصلاحيات والمراجعة.',['أكمل بطاقة العنصر','اختر القناة المتاحة','تابع حالة النشر']],
'google-shopping':['ظهور المنتج في Google Shopping يحتاج بيانات وأهلية قناة مكتملة.',['أكمل بيانات المنتج','راجع متطلبات الشحن والتوفر','تابع أهلية القناة']],
'help':['خدمة العملاء تساعد صاحب النشاط في إعداد الملف والعناصر.',['حدد ما تحتاج إليه','جهّز تفاصيل حسابك غير الحساسة','تواصل مع الدعم']]
};
function enrichFooterPage(){
 const page=document.querySelector('.footer-document');
 if(!page||page.querySelector('.br-guide-steps'))return;
 const route=window.marketLocation.hash.slice(1).split('?')[0];if(route!=='info'&&route!=='owner')return;
 const slug=new URLSearchParams(window.marketLocation.hash.split('?')[1]||'').get('slug')||'about';
 const guide=brGuides[slug];if(!guide)return;
 const node=document.createElement('section');node.className='br-guide-steps';
 node.innerHTML='<div class="br-guide-heading"><small>دليل عملي</small><h2>كيف تستفيد من هذه الخدمة؟</h2><p>'+esc(guide[0])+'</p></div><div class="br-guide-step-grid">'+guide[1].map((step,i)=>'<article class="br-guide-step"><span>0'+(i+1)+'</span><h3>'+esc(step)+'</h3><p>'+esc(['ابدأ بالمعلومات المتاحة في السوق أو تطبيق بيت الريف.','راجع التفاصيل المنشورة وما يلائم نشاطك أو طلبك.','اتخذ الخطوة التي يتيحها العنصر أو النشاط فعليًا.'][i])+'</p></article>').join('')+'</div>';
 const next=page.querySelector('.market-ux-related');if(next)next.before(node);else page.append(node);
}

function footerColumns(){
 const root=document.querySelector('#footer-guide');
 if(!root)return;
 // Preserve every original href, label, order, duplicate and group.
 root.querySelectorAll('details.footer-guide-group').forEach(detail=>{
  const heading=detail.querySelector('summary'),links=detail.querySelector('.footer-guide-links');
  if(!heading||!links)return;
  const section=document.createElement('section');
  section.className='footer-guide-group market-ux-footer-section';
  const title=document.createElement('h2');
  title.textContent=(heading.textContent||'').replace('⌄','').trim();
  section.append(title,links);
  detail.replaceWith(section);
 });
}
function addFooterCards(){
 const page=document.querySelector('.footer-document');
 if(!page||page.querySelector('.market-ux-related'))return;
 const legal=!!page.querySelector('.footer-policy');
 const heading=page.querySelector('h1')?.textContent||'';
 const box=document.createElement('section');
 box.className='market-ux-related';
 box.setAttribute('aria-label','روابط وخطوات مفيدة');
 const official=[
  ['اكتشف المنتجات والخدمات','#categories','تصفح الأقسام الرئيسية وما يتوفر من اختيارات منشورة'],
  ['كيف يعمل السوق؟','#info?slug=how-it-works','اعرف كيف تبدأ بالبحث وتراجع تفاصيل الاختيارات'],
  ['طلب عرض سعر','#info?slug=request-quote','جهز المواصفات والمقاسات والصور المطلوبة'],
  ['حماية العميل','#info?slug=data-protection','راجع كيفية التعامل مع معلوماتك'],
  ['أنشئ متجرك الآن',ctaHref,'ابدأ من تطبيق بيت الريف الرسمي وأكمل بيانات نشاطك'],
  ['سياسة النشر','#info?slug=publication-policy','تعرف على متطلبات اعتماد المحتوى قبل ظهوره'],
  ['خدمة عملاء بيت الريف','#info?slug=customer-service','تحتاج مساعدة في اختيار الخدمة أو التواصل؟']
 ];
 const cards=legal?official.slice(0,4):official;
 box.innerHTML='<div class="market-ux-related-head"><div><span>تابع رحلتك في بيت الريف</span><h2>خطوات وروابط مرتبطة بموضوع '+esc(heading)+'</h2></div><p>مرّر أفقيًا لاكتشاف المزيد، أو انتقل مباشرة إلى ما تحتاجه.</p></div>'+
 '<div class="market-ux-scroll" tabindex="0" aria-label="بطاقات مرتبطة">'+cards.map(([label,href,desc])=>
 '<a class="market-ux-scroll-card" href="'+esc(href)+'"'+(href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':'')+'><strong>'+esc(label)+'</strong><p>'+esc(desc)+'</p><span aria-hidden="true">←</span></a>').join('')+'</div>'+
 '<div class="market-ux-bottom-cta"><div><h3>عندك نشاط وتريد الوصول إلى عملاء جدد؟</h3><p>سجّل نشاطك في تطبيق بيت الريف، وأكمل التوثيق واختر قنوات النشر المتاحة حسب اشتراكك.</p></div><a href="'+ctaHref+'" target="_blank" rel="noopener noreferrer">أنشئ متجرك الآن ←</a></div>';
 page.append(box);
}
function addStoreGuidance(){
 const root=document.querySelector('#content');
 if(!root||root.querySelector('.market-ux-store-guidance'))return;
 if(!window.marketLocation.hash.startsWith('#store'))return;
 const el=document.createElement('section');
 el.className='market-ux-store-guidance';
 el.innerHTML='<h2>ماذا تجد داخل متجر الشركة؟</h2><div class="market-ux-tip-grid">'+
 [['هوية النشاط','التخصص ومناطق الخدمة ووسائل التواصل المنشورة'],
 ['الأعمال','صور المشاريع التي اعتمد صاحب النشاط نشرها'],
 ['المنتجات والخدمات','المواصفات ونطاق العمل والأسعار عند توفرها'],
 ['الطلبات','اطلب عرض سعر عند إتاحة الخدمة من المزود']
 ].map(([a,b])=>'<article><h3>'+esc(a)+'</h3><p>'+esc(b)+'</p></article>').join('')+
 '</div><p class="market-ux-note">الصفحة الحالية نموذج عرض. لا تظهر بيانات شركة أو شارة توثيق إلا من سجل منشور ومعتمد.</p>';
 root.querySelector('.store-header')?.insertAdjacentElement('afterend',el);
}
function addTaxonomy(){
 const root=document.querySelector('#content');if(!root||!taxonomy)return;
 const onCategory=(window.marketLocation.hash.startsWith('#categories')||window.marketLocation.hash==='#home'||!window.marketLocation.hash);
 if(onCategory&&!root.querySelector('.market-ux-specialties')){
  const section=document.createElement('section');
  section.className='market-ux-specialties section';
  section.id='market-specialties';
  section.innerHTML=renderVisualRails();
  (root.querySelector('.room-discovery')||root.querySelector('.home-categories')||root.firstElementChild)?.insertAdjacentElement('afterend',section);
  brStripTools();
 }
 if(window.marketLocation.hash.startsWith('#results')){
   const params=new URLSearchParams(window.marketLocation.hash.split('?')[1]||'');
   const cat=params.get('category')||'',spec=params.get('specialty')||'';
   const form=root.querySelector('#filters-form');
   if(form&&!form.querySelector('#filter-specialty')){
     const field=document.createElement('div');field.className='field';
     field.innerHTML='<label for="filter-specialty">التخصص</label><select id="filter-specialty"><option value="">كل التخصصات</option>'+
       taxonomy.filter(g=>(grouping[cat]||[]).includes(g.key)).flatMap(g=>(g.specialties||[]).map(s=>'<option value="'+esc(s.key)+'"'+(spec===s.key?' selected':'')+'>'+esc(s.name_ar)+'</option>')).join('')+'</select>';
     form.querySelector('#filter-city')?.closest('.field')?.insertAdjacentElement('beforebegin',field);
     // Preserve the existing form handler: it updates the city and category safely.
     // Apply the new specialty only after the original handler has finished.
     form.addEventListener('submit',()=>{
      const chosen=form.querySelector('#filter-specialty')?.value||'';
      const chosenCategory=form.querySelector('#filter-category')?.value||'';
      queueMicrotask(()=>{
       const p=new URLSearchParams(window.marketLocation.hash.split('?')[1]||'');
       if(chosen&&chosenCategory)p.set('specialty',chosen);else p.delete('specialty');
       const next='#results?'+p.toString();
       if(window.marketLocation.hash!==next)window.marketLocation.hash=next;
      });
     });
   }
   if(spec&&!root.querySelector('.market-ux-filter-summary')){
     const item=taxonomy.flatMap(g=>g.specialties||[]).find(x=>x.key===spec);
     const sum=document.createElement('section');sum.className='market-ux-filter-summary br-specialty-landing';
     const parent=landing.find(c=>c[0]===cat)?.[1]||'أقسام السوق';
     sum.innerHTML='<nav aria-label="مسار التصفح"><a href="#categories">سوق بيت الريف</a> / <a href="#results?category='+encodeURIComponent(cat)+'">'+esc(parent)+'</a> / '+esc(item?.name_ar||spec)+'</nav><h2>'+esc(item?.name_ar||spec)+'</h2><p>استكشف المنتجات والخدمات والعروض والمتاجر المرتبطة بهذا التخصص، وراجع ما يقدمه كل نشاط بحسب مدينتك. تظهر البطاقات عندما يتوفر محتوى منشور ومعتمد في النظام.</p><a href="#results?category='+encodeURIComponent(cat)+'">← العودة إلى جميع تخصصات '+esc(parent)+'</a>';
     root.querySelector('.results-layout')?.insertAdjacentElement('beforebegin',sum);
   }
   const empty=root.querySelector('.empty');
   if(empty&&!root.querySelector('.market-ux-empty-link')){
     const a=document.createElement('a');a.className='market-ux-empty-link';a.href='#info?slug=request-quote';a.textContent='لم تجد ما تبحث عنه؟ تعرّف على تجهيز طلب عرض سعر ←';empty.append(a);
   }
 }
 const nav=document.querySelector('.top-nav');
 if(false&&nav&&!nav.querySelector('.market-ux-mega')){
  const menu=document.createElement('details');menu.className='market-ux-mega';
  menu.innerHTML='<summary>التخصصات <span aria-hidden="true">⌄</span></summary><div class="market-ux-mega-panel">'+landing.map(([id,name])=>'<section><h2>'+esc(name)+'</h2>'+renderSpecialties(id)+'</section>').join('')+'</div>';
  nav.append(menu);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));
 }
 const drawer=document.querySelector('#drawer-nav');
 if(false&&drawer&&!drawer.querySelector('.market-ux-drawer-specialties')){
  const panel=document.createElement('div');panel.className='market-ux-drawer-specialties';
  panel.innerHTML='<h3>اختر التخصص</h3>'+landing.map(([id,name])=>'<details><summary>'+esc(name)+'</summary><div>'+renderSpecialties(id)+'</div></details>').join('');
  drawer.append(panel);
 }
}
function enhance(){
 if(running)return;running=true;
 try{footerColumns();addFooterCards();enrichFooterPage();addStoreGuidance();addTaxonomy();}
 finally{running=false;}
}
async function loadTaxonomy(){
 try{
  const x=await fetch('/api/public-market-taxonomy',{credentials:'omit',signal:AbortSignal.timeout(8000)});
  if(!x.ok)throw Error('taxonomy-unavailable');
  const j=await x.json();
  if(!j.ok||!Array.isArray(j.groups))throw Error('taxonomy-invalid');
  taxonomy=j.groups.filter(g=>g&&typeof g.key==='string'&&Array.isArray(g.specialties));
  enhance();
 }catch{
  const nav=document.querySelector('.top-nav');
  if(nav&&!nav.querySelector('.market-ux-taxonomy-status')){
   const span=document.createElement('span');span.className='market-ux-taxonomy-status';
   span.textContent='التخصصات الفرعية غير متاحة مؤقتًا';nav.append(span);
  }
 }
}
const root=document.querySelector('#content');
if(root)new MutationObserver(()=>{if(updated)return;updated=true;requestAnimationFrame(()=>{updated=false;enhance();});}).observe(root,{childList:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(enhance));
document.addEventListener('DOMContentLoaded',enhance,{once:true});
enhance();
void loadTaxonomy();

/* BR 2026 Oct 25: independent QA fixes; no product data writes. */
import {sceneItems as brSceneItems} from './interactive-scene.js';
const brEscape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brDesigns=[['furniture','مجالس وغرف معيشة','تصميمات وتجهيزات حسب المساحة','furniture'],['decor','ديكور وإضاءة','خامات وإضاءة داخلية','lighting'],['kitchen','مطابخ عصرية','تفاصيل التجهيز والخزائن','kitchen'],['garden','حدائق وجلسات','تصميم المساحات الخارجية','garden']];
function brShowcase(){
 const root=document.querySelector('#content');
 if(!root||root.querySelector('.br-works-showcase'))return;
 const heading=[...root.querySelectorAll('.section-head h2')].find(x=>x.textContent?.includes('مساحة لاختياراتك القادمة'));
 const section=heading?.closest('section');if(!section)return;
 section.classList.add('br-works-showcase');
 section.innerHTML='<header class="br-works-heading"><div><small>الإلهام والتصميم</small><h2>تصميمات ثلاثية الأبعاد وأفكار للأعمال</h2><p>استكشف نماذج تصورية تساعدك في تحديد متطلبات مشروعك.</p></div><a href="#categories">جميع الأقسام ←</a></header><div class="br-works-grid">'+brDesigns.map(([id,name,desc,key])=>'<a class="br-work-card" href="#results?category='+id+'"><span class="br-work-image"><img src="'+categoryPhotos[key]+'" loading="lazy" decoding="async" alt="تصور تصميمي: '+brEscape(name)+'"><i>تصميم تصوري</i></span><span class="br-work-copy"><b>'+brEscape(name)+'</b><small>'+brEscape(desc)+'</small><em>استكشف القسم ←</em></span></a>').join('')+'</div><p class="br-works-clarity">صور إلهامية وتصميمات تصورية، وليست مشاريع منفذة باسم شركات أو متاجر. تظهر الأعمال الفعلية بعد النشر والاعتماد.</p>';
}
function brMenuFix(){
 document.querySelectorAll('.top-nav .market-ux-mega,#drawer-nav .market-ux-drawer-specialties').forEach(x=>x.remove());
}
function brFooterFix(){
 const root=document.querySelector('#footer-guide');if(!root)return;
 const groups=[...root.querySelectorAll('section.market-ux-footer-section')];
 if(groups.length!==7)return;
 groups.forEach((group,i)=>{
  const title=group.querySelector('h2'),links=group.querySelector('.footer-guide-links');
  if(!title||!links||title.querySelector('.br-footer-head'))return;
  links.id='br-links-'+i;
  const b=document.createElement('button');b.type='button';b.className='br-footer-head';b.setAttribute('aria-controls',links.id);b.setAttribute('aria-expanded',String(i===0));b.innerHTML='<span>'+brEscape(title.textContent.trim())+'</span><span aria-hidden="true">⌄</span>';
  title.replaceChildren(b);group.classList.toggle('br-footer-open',i===0);
 });
}
let brOverlay=null,brFocus=null;
function brEnsureOverlay(){
 if(brOverlay)return;
 brOverlay=document.createElement('div');brOverlay.className='br-spot-overlay';brOverlay.hidden=true;
 brOverlay.innerHTML='<div class="br-spot-shade" data-br-spot-close></div><section class="br-spot-sheet" role="dialog" aria-modal="true" aria-labelledby="br-spot-title" aria-describedby="br-spot-description"><div class="br-spot-top"><small id="br-spot-kind"></small><button type="button" data-br-spot-close aria-label="إغلاق">✕</button></div><h2 id="br-spot-title"></h2><p id="br-spot-description"></p><a id="br-spot-link" href="#categories">استكشف القسم ←</a></section>';
 document.body.append(brOverlay);
}
function brOpenSpot(id){
 const item=brSceneItems.find(s=>s.id===id);if(!item)return;
 brEnsureOverlay();brFocus=document.activeElement;
 brOverlay.querySelector('#br-spot-kind').textContent=item.kindLabel;
 brOverlay.querySelector('#br-spot-title').textContent=item.title;
 brOverlay.querySelector('#br-spot-description').textContent=item.detail;
 const a=brOverlay.querySelector('#br-spot-link');a.href=item.href;a.textContent=item.action+' ←';
 brOverlay.hidden=false;document.body.classList.add('br-spot-open');brOverlay.querySelector('button').focus();
}
function brCloseSpot(){
 if(!brOverlay||brOverlay.hidden)return;
 brOverlay.hidden=true;document.body.classList.remove('br-spot-open');if(brFocus?.isConnected)brFocus.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
 const s=e.target.closest('.scene-spot[data-scene]');
 if(s){e.preventDefault();e.stopImmediatePropagation();brOpenSpot(s.dataset.scene);return;}
 if(e.target.closest('[data-br-spot-close]')){e.preventDefault();brCloseSpot();return;}
 if(e.target.closest('#br-spot-link')){brCloseSpot();return;}
 const btn=e.target.closest('.br-footer-head');if(btn){const on=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(on));btn.closest('.market-ux-footer-section')?.classList.toggle('br-footer-open',on);}
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')brCloseSpot();
 if(brOverlay&&!brOverlay.hidden&&e.key==='Tab'){
  const first=brOverlay.querySelector('button'),last=brOverlay.querySelector('a');
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
let brRepairQueued=false;
function brRepair(){
 if(brRepairQueued)return;brRepairQueued=true;
 requestAnimationFrame(()=>{brRepairQueued=false;brShowcase();brMenuFix();brFooterFix();});
}
if(document.querySelector('#content'))new MutationObserver(brRepair).observe(document.querySelector('#content'),{childList:true});
window.addEventListener('hashchange',()=>{brCloseSpot();brRepair();});
brRepair();
