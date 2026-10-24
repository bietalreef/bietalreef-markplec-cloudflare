import { categoryPhotos } from './category-photos.js';
/**
 * Marketplace presentation enhancement for the EXISTING Biet Al Reef Worker.
 * Reads only the established, anonymous-read taxonomy RPC via same-origin API.
 * Never writes provider content or changes footer hrefs/indexation.
 */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selected=(c,p)=>new URLSearchParams((location.hash.split('?')[1]||'')).get(p)===c;
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
function renderVisualRails(){
 const all=landing.map(([cat,title])=>{
  const seen=new Set();
  const items=taxonomy.filter(g=>(grouping[cat]||[]).includes(g.key)).flatMap(g=>(g.specialties||[]).map(s=>({s,group:g.name_ar}))).filter(({s})=>{if(!s?.key||!s.name_ar||seen.has(s.key))return false;seen.add(s.key);return true;});
  const cards=items.map(({s,group})=>'<a class="br-specialty-card" href="#results?category='+encodeURIComponent(cat)+'&specialty='+encodeURIComponent(s.key)+'" aria-label="افتح قسم '+esc(s.name_ar)+'"><span class="br-specialty-image"><i aria-hidden="true">↗</i></span><span class="br-specialty-info"><small>'+esc(group)+'</small><strong>'+esc(s.name_ar)+'</strong><em>اكتشف التخصص ←</em></span></a>').join('');
  return '<section class="br-specialty-section" aria-labelledby="br-heading-'+cat+'"><div class="br-specialty-top"><div><small>تصفح بحسب التخصص</small><h3 id="br-heading-'+cat+'">'+esc(title)+'</h3></div><div class="br-specialty-actions"><a href="#results?category='+cat+'">عرض القسم كاملًا</a><button type="button" data-br-rail="-1" aria-label="السابق">→</button><button type="button" data-br-rail="1" aria-label="التالي">←</button></div></div><div class="br-specialty-track" tabindex="0" aria-label="تخصصات '+esc(title)+'، مرّر لعرض المزيد" style="--br-photo:url('+String(categoryPhotos[cat]||'')+')">'+(cards||'<p>تخصصات هذا القسم قيد التجهيز.</p>')+'</div></section>';
 }).join('');
 return '<div class="section-head br-specialty-heading"><div><h2>التخصصات داخل كل قسم</h2><p>مرّر بطاقات التخصصات واختر ما تحتاجه لمنزلك أو مشروعك. كل بطاقة تفتح نتائج القسم والتخصص مباشرة.</p></div></div><div class="br-specialty-rails">'+all+'</div>';
}
if(!window.__BR_rails_interaction){
 window.__BR_rails_interaction=true;
 document.addEventListener('click',e=>{const btn=e.target.closest('[data-br-rail]');if(!btn)return;const el=btn.closest('.br-specialty-section')?.querySelector('.br-specialty-track');const card=el?.querySelector('.br-specialty-card');if(el&&card)el.scrollBy({left:-Number(btn.dataset.brRail)*(card.getBoundingClientRect().width+12),behavior:'smooth'});});
 setInterval(()=>{if(document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(const el of document.querySelectorAll('.br-specialty-track')){const r=el.getBoundingClientRect();if(r.top>innerHeight*.92||r.bottom<0||el.matches(':hover')||el.contains(document.activeElement)||el.scrollWidth<=el.clientWidth+5)continue;const step=(el.querySelector('.br-specialty-card')?.getBoundingClientRect().width||225)+12,max=el.scrollWidth-el.clientWidth;if(Math.abs(el.scrollLeft)>=max-step*.6)el.scrollTo({left:0,behavior:'smooth'});else el.scrollBy({left:-step,behavior:'smooth'});}},7200);
}
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
 const route=location.hash.slice(1).split('?')[0];if(route!=='info'&&route!=='owner')return;
 const slug=new URLSearchParams(location.hash.split('?')[1]||'').get('slug')||'about';
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
 '<a class="market-ux-scroll-card" hre --- TRUNCATED --- 18,627 chars