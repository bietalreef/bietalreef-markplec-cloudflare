import {resultHref} from './routes.js';
import {sceneItems} from './interactive-scene.js';
import {footerSections,infoDocuments,legalDocuments,ownerTopics} from './footer-pages.js';
// Public shopping experience: keep buyer-facing copy warm and avoid developer notices.
const paths = {
  menu:'M4 6h16M4 12h16M4 18h16', search:'m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  pin:'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  house:'m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7',
  sofa:'M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3M4 18h16M5 18v3m14-3v3M4 11a2 2 0 0 0-2 2v5h20v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-2-2Z',
  lamp:'M8 3h8l4 10H4L8 3ZM12 13v8m-5 0h10',
  kitchen:'M3 4h18v16H3ZM3 12h18M11 4v16M14 8h3M6 8h2m6 8h3M6 16h2',
  tools:'m14 5 5-3-1 6-4 3-9 10-3-3 10-9ZM3 3l5 2 1 4-2 2-4-4V3Zm8 11 7 7 3-3-7-7',
  garden:'M12 21v-9M12 15C3 16 2 8 3 4c5 0 10 3 9 9M12 12c0-6 5-10 10-10 1 7-3 12-10 12',
  store:'M3 9h18l-2-6H5L3 9ZM4 9v12h16V9M9 21v-7h6v7M3 9c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0',
  box:'m3 7 9-5 9 5v11l-9 4-9-4V7Zm0 0 9 5 9-5M12 12v10M7 4l10 5',
  grid:'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  tag:'m3 3 9 0 10 10-9 9L3 12V3ZM7 7h.01',
  shield:'m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm-4 10 3 3 5-6',
  layers:'m2 7 10-5 10 5-10 5L2 7Zm0 5 10 5 10-5M2 17l10 5 10-5',
  arrow:'M20 12H4m6-6-6 6 6 6', filter:'M3 5h18M6 12h12m-8 7h4',
  document:'M5 2h10l5 5v15H5V2Zm9 0v6h6M8 12h9M8 16h9',
  star:'m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1 3-6'
};
const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.box}"/></svg>`;
const categories = [
  {id:'furniture',name:'أثاث ومعيشة',sub:'مساحات على ذوقك',icon:'sofa'},
  {id:'decor',name:'ديكور وإضاءة',sub:'تفاصيل تصنع الفرق',icon:'lamp'},
  {id:'kitchen',name:'مطابخ وتجهيزات',sub:'كل ما يكمل بيتك',icon:'kitchen'},
  {id:'maintenance',name:'صيانة وخدمات',sub:'عناية بكل زاوية',icon:'tools'},
  {id:'garden',name:'حدائق وخارجيات',sub:'امتداد جميل لبيتك',icon:'garden'},
  {id:'construction',name:'بناء وتشطيبات',sub:'من الفكرة إلى التنفيذ',icon:'house'}
];
const cities=['كل الإمارات','العين','أبوظبي','دبي','الشارقة','عجمان','رأس الخيمة','الفجيرة','أم القيوين'];
const types={all:'كل النتائج',product:'المنتجات',service:'الخدمات',offer:'العروض',store:'المتاجر والشركات'};
const content=document.querySelector('#content');
const menu=document.querySelector('#side-menu');
const locationDialog=document.querySelector('#location-dialog');
let city='كل الإمارات';
let lastFocus=null;
let toastTimer;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categoryLinks=()=>categories.map(c=>`<a class="category" href="#results?category=${c.id}"><span class="category-icon">${icon(c.icon)}</span><b>${c.name}</b><small>${c.sub}</small></a>`).join('');
const roomArt=`<svg viewBox="0 0 620 440" role="img" aria-label="رسم تصوري أصلي لمساحة معيشة هادئة"><defs><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#e9e8dd"/><stop offset="1" stop-color="#d5d6c5"/></linearGradient><linearGradient id="seat" x2="0" y2="1"><stop stop-color="#c4c7ac"/><stop offset="1" stop-color="#a2aa89"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="9"/></filter></defs><rect width="620" height="440" fill="url(#wall)"/><path d="M0 336H620V440H0Z" fill="#dcd6c8"/><path d="M0 336H620" stroke="#cfccbd" stroke-width="2"/><path d="M100 0V336M103 0V336" stroke="#d0d3c1"/><rect x="417" y="20" width="146" height="231" rx="72" fill="#d0d2bf"/><rect x="428" y="30" width="124" height="212" rx="62" fill="#f0eee3"/><path d="M490 32V241M429 130H551" stroke="#d3d4c5" stroke-width="3"/><ellipse cx="290" cy="380" rx="217" ry="29" fill="#d1c5ad"/><ellipse cx="290" cy="382" rx="195" ry="18" fill="#f0eadd"/><ellipse cx="270" cy="361" rx="170" ry="12" opacity=".15" filter="url(#shadow)" fill="#253a27"/><path d="M129 301v53M386 301v53" stroke="#665c46" stroke-width="8"/><rect x="128" y="216" width="257" height="105" rx="30" fill="url(#seat)"/><rect x="112" y="274" width="290" height="56" rx="18" fill="#acb392"/><rect x="111" y="259" width="36" height="73" rx="16" fill="#b9bf9f"/><rect x="367" y="259" width="36" height="73" rx="16" fill="#b9bf9f"/><rect x="151" y="241" width="66" height="59" rx="11" transform="rotate(-8 151 241)" fill="#e9e2d2"/><rect x="290" y="238" width="59" height="58" rx="11" transform="rotate(10 290 238)" fill="#8b9479"/><path d="M448 301v80M511 301v80" stroke="#827358" stroke-width="7"/><ellipse cx="479" cy="302" rx="67" ry="18" fill="#a5987c"/><ellipse cx="479" cy="298" rx="67" ry="18" fill="#cbbda1"/><path d="M466 282h28l-4-37h-19Z" fill="#efeee5"/><path d="M480 249v-36m0 10c-21-4-25-17-22-26 17 0 25 14 22 26m0 12c19-3 26-16 23-24-17 1-24 12-23 24" stroke="#7e8e68" stroke-width="3" fill="#97a482"/><path d="M65 326v-185" stroke="#80755d" stroke-width="4"/><path d="M40 149h51l-9-38H50Z" fill="#eee9d9"/><ellipse cx="65" cy="329" rx="28" ry="6" fill="#a39478"/><rect x="181" y="63" width="103" height="108" fill="#b5ac95"/><rect x="186" y="68" width="93" height="98" fill="#f2ede0"/><path d="M197 144q20-67 42-40t29 39" fill="#bcc0a5"/><circle cx="246" cy="91" r="12" fill="#d0b892"/><path d="M0 400l620-10" stroke="#e4ddcf"/></svg>`;
function emptyState({title='اختيارات جديدة قريبًا',text='نعمل على إضافة منتجات وخدمات من متاجر قريبة منك. تصفح الأقسام واختر ما يناسبك.',template=true}={}){
 return `<div class="empty"><span class="empty-symbol">${icon('box')}</span><h3>${title}</h3><p>${text}</p><div class="empty-actions">${template?'<a class="button secondary" href="#detail?type=product">استكشف التفاصيل '+icon('arrow')+'</a>':''}<a class="button primary" href="#categories">تصفح الأقسام</a></div></div>`;
}
const crumbs=label=>`<nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="#home">السوق</a><span aria-hidden="true">/</span><span>${escapeHTML(label)}</span></nav>`;
// Hotspots are public category guides, never invented products or transactions.
const sceneButtons=()=>sceneItems.map(item=>`<button type="button" class="scene-spot" data-scene="${item.id}" aria-label="${escapeHTML(item.label)} — ${escapeHTML(item.kindLabel)}" title="${escapeHTML(item.label)}" style="--wide-x:${item.coords.wide[0]}%;--wide-y:${item.coords.wide[1]}%;--mobile-x:${item.coords.mobile[0]}%;--mobile-y:${item.coords.mobile[1]}%"><span class="scene-spot-dot" aria-hidden="true">+</span><span class="scene-spot-caption">${escapeHTML(item.label)}</span></button>`).join('');
function showSceneDetail(item){
  const panel=document.getElementById('scene-dialog');
  if(!panel||!item)return;
  const heading=document.getElementById('scene-dialog-title');
  const body=document.getElementById('scene-dialog-body');
  heading.textContent=item.title;
  body.textContent=item.detail;
  document.getElementById('scene-dialog-kind').textContent=item.kindLabel;
  const link=document.getElementById('scene-dialog-link');
  link.href=item.href;
  link.textContent=item.action;
  if(typeof panel.showModal==='function'&&!panel.open)panel.showModal();
}
function home(){
 return `<div class="wrap"><section class="hero"><div class="hero-copy"><div class="eyebrow">بيتك، بطريقتك</div><h1>كل ما يحتاجه بيتك،<br><em>في مكان واحد.</em></h1><p>من قطعة أثاث تحبها إلى خدمة تحتاجها، ستجد اختيارات بيتك في مكان واحد.</p><div class="hero-cta"><a href="#categories" class="button primary">اكتشف الأقسام ${icon('arrow')}</a><a href="#journey" class="text-link">تعرف على السوق</a></div></div><div class="hero-art scene-art" aria-label="تعرّف على المنتجات والخدمات في مساحة البيت"><span class="art-label">اكتشف التفاصيل باللمس</span><div class="room-art scene-art-wide" aria-hidden="true">${roomArt}</div><div class="room-art scene-art-mobile" aria-hidden="true">${roomArt}</div><div class="scene-markers" aria-label="عناصر الغرفة">${sceneButtons()}</div></div></section><section class="section" aria-labelledby="categories-title"><div class="section-head"><div><h2 id="categories-title">ابدأ بما تبحث عنه</h2><p>ابدأ بما تحب، ونحن نسهّل عليك الباقي.</p></div><a href="#categories">كل الأقسام ←</a></div><div class="category-grid">${categoryLinks()}</div></section><section class="discovery-grid" aria-label="مسارات الاكتشاف"><article class="discovery-card"><div><span class="eyebrow">للبيت والحياة</span><h3>تفاصيل تشبهك.</h3><p>استكشف أقسام الأثاث والديكور والتجهيزات.</p><a class="text-link" href="#results?type=product">استكشف المنتجات ←</a></div><span class="big-icon">${icon('sofa')}</span></article><article class="discovery-card"><div><span class="eyebrow">للعمل والإنجاز</span><h3>خدمة تبدأ باحتياجك.</h3><p>من الصيانة إلى التصميم وتنفيذ الأعمال.</p><a class="text-link" href="#results?type=service">استكشف الخدمات ←</a></div><span class="big-icon">${icon('tools')}</span></article></section><section class="section"><div class="section-head"><div><h2>مساحة لاختياراتك القادمة</h2><p>مساحة جديدة لاكتشاف المنتجات والخدمات.</p></div><a href="#results">استعراض السوق ←</a></div>${emptyState()}</section><section class="trust-strip" aria-label="مبادئ التجربة"><div class="trust-item">${icon('search')}<span><b>تصفح بدون تسجيل</b><small>ابدأ البحث مباشرة.</small></span></div><div class="trust-item">${icon('layers')}<span><b>متاجر في مكان واحد</b><small>تعرّف على الأنشطة القريبة منك.</small></span></div><div class="trust-item">${icon('shield')}<span><b>اختيارات موثوقة</b><small>تعرف على النشاط قبل التواصل معه.</small></span></div></section></div>`;
}
function categoriesPage(){return `<div class="wrap">${crumbs('كل الأقسام')}<h1 class="page-title">مساحات مختلفة. سوق واحد.</h1><p class="page-intro">اختر القسم، ثم خصص نوع العنصر والمدينة للوصول إلى ما يناسبك.</p><section class="section"><div class="category-grid">${categoryLinks()}</div></section><div class="note">استكشف الأقسام واختر ما تبحث عنه بسهولة.</div><section class="section"><div class="section-head"><h2>كيف تحب أن تتصفح؟</h2></div><div class="discovery-grid"><a class="discovery-card" href="#results?type=product"><div><h3>ابحث عن منتج</h3><p>المواصفات، خيارات السعر، ومعلومات المتجر.</p></div><span class="big-icon">${icon('box')}</span></a><a class="discovery-card" href="#results?type=service"><div><h3>ابحث عن خدمة</h3><p>نطاق العمل، مناطق الخدمة، وطريقة التواصل.</p></div><span class="big-icon">${icon('tools')}</span></a></div></section></div>`;}
function resultsPage(params){
 const type=Object.hasOwn(types,params.get('type'))?params.get('type'):'all';
 const cat=categories.find(c=>c.id===params.get('category'));
 const q=params.get('q')||'';
 const title=q?`نتائج البحث عن «${q}»`:cat?.name||types[type];
 return `<div class="wrap">${crumbs(title)}<h1 class="page-title">${escapeHTML(title)}</h1><p class="page-intro">تصفح ${escapeHTML(city)} · يمكنك تعديل النوع والقسم والمدينة.</p><div class="chips">${Object.entries(types).map(([k,v])=>`<a class="chip ${k===type?'active':''}" href="${escapeHTML(resultHref(params,{type:k}))}" ${k===type?'aria-current="page"':''}>${v}</a>`).join('')}</div><div class="results-layout"><aside id="filters" class="filters"><h2>خصص بحثك</h2><form id="filters-form"><div class="field"><label for="filter-category">القسم</label><select id="filter-category"><option value="">كل الأقسام</option>${categories.map(c=>`<option value="${c.id}" ${c===cat?'selected':''}>${c.name}</option>`).join('')}</select></div><div class="field"><label for="filter-city">المدينة</label><select id="filter-city">${cities.map(c=>`<option ${c===city?'selected':''}>${c}</option>`).join('')}</select></div><button class="button primary" type="submit">تطبيق الاختيارات</button></form><button class="text-link" id="reset-filters" style="margin-top:16px">مسح التصفية</button></aside><section><div class="results-top"><span>اختيارات جديدة قريبًا</span><button class="mobile-filter" id="toggle-filters" aria-expanded="false" aria-controls="filters">${icon('filter')} تصفية</button><span>الترتيب: الأحدث</span></div>${emptyState({title:q?'لا توجد نتائج منشورة لهذا البحث':'هذا القسم جاهز لاستقبال البطاقات',text:'لا تتوفر اختيارات في هذا القسم الآن. يمكنك متابعة تصفح الأقسام الأخرى.'})}<div class="note" style="margin-top:18px">اكتشف أيضًا: <a class="text-link" href="#detail?type=${type==='service'?'service':type==='offer'?'offer':'product'}">تفاصيل المنتجات والخدمات</a> · <a class="text-link" href="#store">صفحة المتجر</a></div></section></div></div>`;
}
function detailPage(params){const type=['service','offer'].includes(params.get('type'))?params.get('type'):'product';const label={product:'منتج',service:'خدمة',offer:'عرض'}[type];return `<div class="wrap">${crumbs('تفاصيل الاختيارات')}<div class="note">لا يتوفر منتج محدد في هذه الصفحة حاليًا، ويمكنك استكشاف طريقة عرض التفاصيل.</div><section class="template-layout"><div class="template-visual"><span class="template-tag">قالب ${label}</span><span class="big-icon">${icon(type==='service'?'tools':type==='offer'?'tag':'sofa')}</span></div><div class="template-body"><span class="eyebrow">التفاصيل التي تساعد على الاختيار</span><h1>هنا يظهر اسم ${label==='خدمة'?'الخدمة':label==='عرض'?'العرض':'المنتج'}</h1><p>${type==='service'?'وصف واضح للخدمة، وما يشمله العمل وما لا يشمله، والمعلومات المطلوبة لتقديم عرض سعر.':type==='offer'?'تفاصيل العرض وشروط الاستفادة منه، وفترة الصلاحية، والعناصر التي يشملها.':'وصف مختصر يوضح استخدام المنتج وخاماته ومميزاته، مع الصور والمواصفات الفعلية عند توفرها.'}</p><div class="specs"><div><small>السعر</small>يظهر عند توفره</div><div><small>${type==='service'?'منطقة الخدمة':'التوفر'}</small>اسأل عن التوفر</div><div><small>النشاط</small><a class="text-link" href="#store">اكتشف المتجر ←</a></div><div><small>الهوية والتوثيق</small>معلومات المتجر تظهر هنا</div></div><button class="button primary" data-preview-action>${type==='service'?'استفسر عن الخدمة':'اسأل عن المنتج'} ${icon('arrow')}</button><p class="subtle">سيتوفر التواصل مع الأنشطة عند ظهورها في السوق.</p></div></section><div class="template-tabs" role="tablist" aria-label="تفاصيل القالب"><button role="tab" id="tab-description" aria-selected="true" aria-controls="detail-panel" data-detail-tab="description">التفاصيل</button><button role="tab" id="tab-specs" aria-selected="false" aria-controls="detail-panel" data-detail-tab="specs" tabindex="-1">المواصفات والشروط</button><button role="tab" id="tab-provider" aria-selected="false" aria-controls="detail-panel" data-detail-tab="provider" tabindex="-1">عن النشاط</button></div><div id="detail-panel" role="tabpanel" aria-labelledby="tab-description" class="page-intro" style="min-height:135px">ستجد هنا وصف المنتج أو الخدمة، وأهم التفاصيل التي تساعدك تختار.</div><section class="section"><div class="section-head"><h2>استكشف شكل البطاقة</h2></div><div class="chips"><a class="chip ${type==='product'?'active':''}" href="#detail?type=product">منتج</a><a class="chip ${type==='service'?'active':''}" href="#detail?type=service">خدمة</a><a class="chip ${type==='offer'?'active':''}" href="#detail?type=offer">عرض</a></div></section></div>`;}
function storePage(){return `<div class="wrap">${crumbs('متجر النشاط')}<div class="note">ستجد هنا معلومات المتجر وما يقدمه عندما يصبح متاحًا.</div><section class="store-header"><span class="store-avatar">${icon('store')}</span><div><span class="template-tag">صفحة المتجر</span><h1>اسم النشاط التجاري</h1><p>نبذة موجزة عن النشاط وتخصصه ومناطق خدمته.</p></div></section><div class="chips" role="group" aria-label="محتوى المتجر"><button class="chip active" data-store-tab="all">الكل</button><button class="chip" data-store-tab="product">منتجات</button><button class="chip" data-store-tab="service">خدمات</button><button class="chip" data-store-tab="offer">عروض</button></div><section class="section"><div id="store-content">${emptyState({title:'بطاقات النشاط تظهر هنا',text:'تعتمد هذه الصفحة على هوية النشاط وأصل عناصره. لا تنشئ لوحة الإدارة محتوى نيابة عن صاحب الحساب.'})}</div></section></div>`;}
function journeyPage(){return `<div class="wrap">${crumbs('كيف يعمل السوق؟')}<h1 class="page-title">من فكرتك إلى اختيارك المناسب</h1><p class="page-intro">اكتشف ما تحتاجه، تعرّف على التفاصيل، وتواصل مع أصحاب الأعمال بسهولة.</p><section class="flow-grid">${[
['01','ابحث عما تحتاجه','تصفح المنتجات والخدمات، أو ابدأ بالبحث عن احتياجك.'],
['02','اختر المناسب لك','راجع التفاصيل والصور ومعلومات المتجر قبل اتخاذ قرارك.'],
['03','تواصل بثقة','اسأل عن التوفر والتفاصيل واطلب عرض سعر عند توفر الخدمة.'],
['04','عندك نشاط تجاري؟','جهز ملف نشاطك، وأضف خدماتك ومنتجاتك من مساحة أعمالك.']
].map(([n,h,p])=>`<article class="flow-card"><span class="flow-number">${n}</span><h2>${h}</h2><p>${p}</p></article>`).join('')}</section><section class="section"><div class="section-head"><h2>استكشف بيت الريف</h2></div><div class="discovery-grid"><a class="discovery-card" href="#results?type=product"><div><h3>منتجات لبيتك</h3><p>أفكار تلهمك، وتفاصيل تساعدك تختار.</p></div><span class="big-icon">${icon('sofa')}</span></a><a class="discovery-card" href="#results?type=service"><div><h3>خدمات تسهّل يومك</h3><p>ابحث عن مختص يساعدك في مشروعك.</p></div><span class="big-icon">${icon('tools')}</span></a></div></section></div>`;}
function informationPage(params) {
  const slug = params.get('slug') || 'about';
  const doc = Object.hasOwn(infoDocuments, slug) ? infoDocuments[slug] : null;
  if (!doc) return missingFooterPage();
  return `<div class="wrap footer-document">${crumbs(doc.arTitle)}<section class="footer-page-hero"><span class="footer-eyebrow">دليل سوق بيت الريف</span><h1>${escapeHTML(doc.arTitle)}</h1><p>${escapeHTML(doc.arIntro)}</p></section><section class="footer-page-body" aria-label="التفاصيل"><h2>ما الذي تحتاج إلى معرفته؟</h2><div class="footer-facts">${doc.arItems.map((v,n) => `<article class="footer-fact"><span aria-hidden="true">${String(n+1).padStart(2,'0')}</span><p>${escapeHTML(v)}</p></article>`).join('')}</div><aside class="footer-help"><span>هل تحتاج إلى مساعدة؟</span><a href="#info?slug=customer-service" class="button primary">مركز المساعدة ${icon('arrow')}</a></aside></section></div>`;
}

function policyPage(params) {
  const slug = params.get('slug') || 'privacy';
  const doc = Object.hasOwn(legalDocuments, slug) ? legalDocuments[slug] : null;
  if (!doc) return missingFooterPage();
  const official = slug === 'legal' ? 'legal' : slug === 'cookies' ? 'cookies' : 'privacy';
  return `<div class="wrap footer-document">${crumbs(doc.title)}<section class="footer-page-hero"><span class="footer-eyebrow">${escapeHTML(doc.badge)}</span><h1>${escapeHTML(doc.title)}</h1><p>${escapeHTML(doc.intro)}</p><a class="footer-official-link" href="https://app.bietalreef.ae/${official}" target="_blank" rel="noopener noreferrer">عرض السياسة الحالية على السوق الرسمي ↗</a></section><section class="footer-policy" aria-label="نص السياسة">${doc.sections.map((part,index) => `<article class="footer-policy-section" id="policy-part-${index+1}"><h2>${escapeHTML(part.title)}</h2>${(part.paragraphs || []).map(p=>`<p>${escapeHTML(p)}</p>`).join('')}${part.items?.length ? `<ul>${part.items.map(item=>`<li>${escapeHTML(item)}</li>`).join('')}</ul>` : ''}</article>`).join('')}</section></div>`;
}

function ownerInfoPage(params) {
  const topic = params.get('topic') || 'join';
  const page = Object.hasOwn(ownerTopics, topic) ? ownerTopics[topic] : null;
  if (!page) return missingFooterPage();
  return `<div class="wrap footer-document">${crumbs(page.title)}<section class="footer-page-hero"><span class="footer-eyebrow">لأصحاب الأعمال</span><h1>${escapeHTML(page.title)}</h1><p>${escapeHTML(page.text)}</p></section><section class="footer-page-body"><h2>ابدأ من حساب نشاطك</h2><p>جميع خطوات إنشاء متجرك وإدارة محتواه تتم من مساحة أعمالك نفسها. يمكنك مراجعة المتجر قبل نشر العناصر المؤهلة.</p><div class="footer-owner-actions"><a class="button primary" href="https://providers.bietalreef.ae" target="_blank" rel="noopener noreferrer">افتح مساحة أعمالك ${icon('arrow')}</a><a class="button secondary" href="#info?slug=publication-policy">سياسة النشر</a></div></section></div>`;
}

function missingFooterPage() {
  return `<div class="wrap footer-document">${crumbs('صفحة غير متاحة')}<section class="footer-page-hero"><h1>لم نعثر على هذه الصفحة</h1><p>يمكنك متابعة التصفح أو العودة إلى أقسام السوق.</p><a href="#home" class="button primary">العودة للسوق ${icon('arrow')}</a></section></div>`;
}

function footerSitemap() {
  const links = [...footerSections.flatMap(s=>s.links.map(([title,href])=>({title,href}))),{title:'الخصوصية',href:'#policy?slug=privacy'},{title:'شروط الاستخدام',href:'#policy?slug=legal'},{title:'ملفات الارتباط',href:'#policy?slug=cookies'}];
  const unique = [...new Map(links.map(l=>[l.href,l])).values()];
  return `<div class="wrap footer-document">${crumbs('خريطة الموقع')}<section class="footer-page-hero"><span class="footer-eyebrow">دليلك إلى السوق</span><h1>خريطة الموقع</h1><p>جميع صفحات المساعدة والأقسام في مكان واحد.</p></section><nav class="footer-map-links" aria-label="خريطة الموقع">${unique.map(l=>`<a href="${escapeHTML(l.href)}">${escapeHTML(l.title)} ${icon('arrow')}</a>`).join('')}</nav></div>`;
}

function renderFooter() {
  const footer = document.querySelector('#footer-guide');
  if (!footer) return;
  const link = (label,href)=>`<a href="${escapeHTML(href)}">${escapeHTML(label)} ${icon('arrow')}</a>`;
  const groups = [
    ...footerSections.map(section=>({name:section.title,links:section.links.map(([label,href])=>link(label,href))})),
    {name:'التصنيفات',links:categories.map(c=>link(c.name,`#results?category=${c.id}`))},
    {name:'المدن والمناطق',links:cities.slice(1).map(c=>`<a href="#results" data-drawer-city="${escapeHTML(c)}">${escapeHTML(c)} ${icon('pin')}</a>`)}
  ];
  footer.innerHTML = `<div class="footer-guide-top"><span>كل ما تحتاجه عن السوق</span><button type="button" data-footer-top>العودة للأعلى ↑</button></div><div class="footer-guide-grid">${groups.map(group=>`<details class="footer-guide-group"><summary>${escapeHTML(group.name)} <span aria-hidden="true">⌄</span></summary><div class="footer-guide-links">${group.links.join('')}</div></details>`).join('')}</div><nav class="footer-legal" aria-label="السياسات والروابط المهمة"><a href="#policy?slug=privacy">الخصوصية</a><a href="#policy?slug=legal">شروط الاستخدام</a><a href="#policy?slug=cookies">ملفات الارتباط</a><a href="#info?slug=data-protection">حماية البيانات</a><a href="#sitemap">خريطة الموقع</a></nav>`;
}

function render({focus=false}={}){
 const [route,raw='']=(location.hash.slice(1)||'home').split('?');const params=new URLSearchParams(raw);
 const pages={home, categories:categoriesPage, results:()=>resultsPage(params),detail:()=>detailPage(params),store:storePage,journey:journeyPage,info:()=>informationPage(params),policy:()=>policyPage(params),owner:()=>ownerInfoPage(params),sitemap:footerSitemap};
 content.innerHTML=(pages[route]||home)();
 document.querySelectorAll('[data-tab]').forEach(a=>{const active=a.dataset.tab===route||(route==='results'&&a.dataset.tab===params.get('type'));active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current');});
 document.querySelector('#search').value=route==='results'?params.get('q')||'':'';
 document.title=`${({home:'سوق بيت الريف',categories:'كل الأقسام',results:'البحث في السوق',detail:'تفاصيل الاختيارات',store:'المتجر',journey:'كيف يعمل السوق؟',info:'دليل السوق',policy:'السياسات',owner:'لأصحاب الأعمال',sitemap:'خريطة الموقع'})[route]||'سوق بيت الريف'} — بيت الريف`;
 closeMenu();if(focus){window.scrollTo({top:0,behavior:'instant'});content.focus({preventScroll:true});}
 bindPage(params);
}
function bindPage(params){
 document.querySelector('#filters-form')?.addEventListener('submit',e=>{e.preventDefault();city=document.querySelector('#filter-city').value;refreshCity();const category=document.querySelector('#filter-category').value;const href=resultHref(params,{category});if(location.hash===href){render({focus:true});}else location.hash=href;});
 document.querySelector('#reset-filters')?.addEventListener('click',()=>{city=cities[0];refreshCity();location.hash='results';if(location.hash==='#results')render();});
 document.querySelector('#toggle-filters')?.addEventListener('click',e=>{const shown=document.querySelector('#filters').classList.toggle('visible');e.currentTarget.setAttribute('aria-expanded',String(shown));});
 const tabButtons=[...document.querySelectorAll('[data-detail-tab]')];
 const selectTab=button=>{tabButtons.forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});const panel=document.querySelector('#detail-panel');panel.setAttribute('aria-labelledby',button.id);panel.textContent={description:'ستجد هنا وصف المنتج أو الخدمة، وأهم التفاصيل التي تساعدك تختار.',specs:'تعرف على المواصفات أو نطاق الخدمة أو شروط العرض، بحسب ما يقدمه النشاط.',provider:'تعرف على صاحب النشاط، وتخصصه، وطرق التواصل المتاحة.'}[button.dataset.detailTab];};
 tabButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectTab(button));button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowLeft')next=(index+1)%tabButtons.length;if(e.key==='ArrowRight')next=(index+tabButtons.length-1)%tabButtons.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabButtons.length-1;if(next!==undefined){e.preventDefault();selectTab(tabButtons[next]);tabButtons[next].focus();}});});
 document.querySelectorAll('[data-store-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-store-tab]').forEach(b=>b.classList.toggle('active',b===button));document.querySelector('#store-content').innerHTML=emptyState({title:button.dataset.storeTab==='all'?'بطاقات النشاط تظهر هنا':`لم تُنشر ${types[button.dataset.storeTab]} بعد`,text:'ستجد هنا منتجات النشاط وخدماته وعروضه.'});}));
}
function closeMenu(){if(menu.open)menu.close();document.querySelector('#open-menu').setAttribute('aria-expanded','false');document.body.style.overflow='';}
function openDialog(dialog){lastFocus=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';}
function restoreFocus(){document.body.style.overflow='';lastFocus?.focus();}
function refreshCity(){document.querySelector('#current-city').textContent=city;document.querySelectorAll('[data-city]').forEach(b=>b.classList.toggle('active',b.dataset.city===city));}
document.querySelector('#open-menu').innerHTML=icon('menu');document.querySelector('.brand-symbol').innerHTML=icon('house');document.querySelector('.footer .brand-symbol').innerHTML=icon('house');document.querySelector('.search-symbol').innerHTML=icon('search');document.querySelector('.pin-symbol').innerHTML=icon('pin');
document.querySelector('#drawer-nav').innerHTML=`<h3>اكتشف السوق</h3>${[['home','الرئيسية','house'],['categories','كل الأقسام','grid'],['results?type=product','المنتجات','box'],['results?type=service','الخدمات','tools'],['results?type=offer','العروض','tag'],['results?type=store','المتاجر والشركات','store']].map(([r,l,i])=>`<a href="#${r}">${icon(i)} ${l}</a>`).join('')}<h3>ابحث بسهولة</h3><details><summary>حسب القسم</summary>${categories.map(c=>`<a href="#results?category=${c.id}">${c.name}</a>`).join('')}</details><details><summary>حسب المدينة</summary>${cities.slice(1).map(c=>`<a href="#results" data-drawer-city="${c}">${c}</a>`).join('')}</details><h3>دليلك للسوق</h3><a href="#info?slug=how-it-works">${icon('layers')} كيف يعمل السوق؟</a><a href="#info?slug=customer-service">${icon('document')} مركز المساعدة</a><a href="#policy?slug=privacy">${icon('shield')} الخصوصية</a>`;
document.querySelector('#city-options').innerHTML=cities.map(c=>`<button data-city="${c}" class="${c===city?'active':''}">${c}</button>`).join('');
document.querySelector('#search-form').addEventListener('submit',e=>{e.preventDefault();const q=document.querySelector('#search').value.trim();const hash='#results'+(q?'?q='+encodeURIComponent(q):'');if(location.hash===hash)render({focus:true});else location.hash=hash;});
document.querySelector('#open-menu').addEventListener('click',()=>{openDialog(menu);document.querySelector('#open-menu').setAttribute('aria-expanded','true');});
menu.addEventListener('close',()=>{document.querySelector('#open-menu').setAttribute('aria-expanded','false');restoreFocus();});
locationDialog.addEventListener('close',restoreFocus);
for(const dialog of [menu,locationDialog])dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
document.addEventListener('click',e=>{
 const target=e.target.closest('button,a');if(!target)return;
 if(target.hasAttribute('data-close-menu'))closeMenu();
 if(target.hasAttribute('data-location'))openDialog(locationDialog);
 if(target.hasAttribute('data-close-location'))locationDialog.close();
 if(target.dataset.city){city=target.dataset.city;refreshCity();locationDialog.close();render();}
 if(target.dataset.drawerCity){city=target.dataset.drawerCity;refreshCity();closeMenu();if(location.hash==='#results')render({focus:true});}
 if(target.dataset.route){if(location.hash==='#'+target.dataset.route)render({focus:true});else location.hash=target.dataset.route;}
 if(target.closest('#drawer-nav')&&target.tagName==='A')closeMenu();
 if(target.hasAttribute('data-footer-top'))window.scrollTo({top:0,behavior:'smooth'});
 if(target.dataset.scene){showSceneDetail(sceneItems.find(item=>item.id===target.dataset.scene));}
 if(target.hasAttribute('data-scene-close'))document.getElementById('scene-dialog')?.close();
 if(target.hasAttribute('data-preview-action')){const toast=document.querySelector('#toast');toast.textContent='هذه الخدمة غير متاحة الآن. يمكنك متابعة استكشاف السوق.';toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,4000);}
});
document.getElementById('scene-dialog-link')?.addEventListener('click',()=>document.getElementById('scene-dialog')?.close());
// A green badge appears only when this public origin answers successfully.
// This status does not imply a logged-in user, connected WhatsApp or provider API.
async function verifyPublicConnection(){
 const badge=document.getElementById('market-connection-status');
 if(!badge)return;
 let alive=false;
 if(navigator.onLine!==false){
   try{
     const response=await fetch('/robots.txt',{method:'HEAD',cache:'no-store',signal:AbortSignal.timeout(6000),credentials:'omit'});
     alive=response.ok;
   }catch{alive=false;}
 }
 badge.classList.toggle('online',alive);
 badge.classList.toggle('offline',!alive);
 badge.classList.remove('checking');
 badge.querySelector('b').textContent=alive?'متصل الآن':'غير متصل';
}
window.addEventListener('online',()=>void verifyPublicConnection());
window.addEventListener('offline',()=>void verifyPublicConnection());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void verifyPublicConnection();});
void verifyPublicConnection();

window.addEventListener('hashchange',()=>render({focus:true}));
renderFooter();
render();
