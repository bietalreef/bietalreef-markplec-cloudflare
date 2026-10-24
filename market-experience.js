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
 if(!location.hash.startsWith('#store'))return;
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
 const onCategory=(location.hash.startsWith('#categories')||location.hash==='#home'||!location.hash);
 if(onCategory&&!root.querySelector('.market-ux-specialties')){
  const section=document.createElement('section');
  section.className='market-ux-specialties section';
  section.id='market-specialties';
  section.innerHTML='<div class="section-head"><div><h2>التخصصات داخل كل قسم</h2><p>هذه التخصصات تُقرأ من التصنيف المعتمد داخل بيت الريف، ولا تُنشأ في السوق بصورة منفصلة.</p></div></div>'+
   '<div class="market-ux-six">'+landing.map(([id,name])=>'<details class="market-ux-category"><summary>'+esc(name)+' <span aria-hidden="true">⌄</span></summary><div>'+renderSpecialties(id)+'</div></details>').join('')+'</div>';
  (root.querySelector('.home-categories')||root.querySelector('.category-grid')?.parentElement||root.firstElementChild)?.insertAdjacentElement('afterend',section);
 }
 if(location.hash.startsWith('#results')){
   const params=new URLSearchParams(location.hash.split('?')[1]||'');
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
       const p=new URLSearchParams(location.hash.split('?')[1]||'');
       if(chosen&&chosenCategory)p.set('specialty',chosen);else p.delete('specialty');
       const next='#results?'+p.toString();
       if(location.hash!==next)location.hash=next;
      });
     });
   }
   if(spec&&!root.querySelector('.market-ux-filter-summary')){
     const item=taxonomy.flatMap(g=>g.specialties||[]).find(x=>x.key===spec);
     const sum=document.createElement('p');sum.className='market-ux-filter-summary';
     sum.textContent='التخصص المحدد: '+(item?.name_ar||spec)+' — تظهر هنا النتائج المنشورة المطابقة عند تفعيل الكتالوج العام.';
     root.querySelector('.results-layout')?.insertAdjacentElement('beforebegin',sum);
   }
   const empty=root.querySelector('.empty');
   if(empty&&!root.querySelector('.market-ux-empty-link')){
     const a=document.createElement('a');a.className='market-ux-empty-link';a.href='#info?slug=request-quote';a.textContent='لم تجد ما تبحث عنه؟ تعرّف على تجهيز طلب عرض سعر ←';empty.append(a);
   }
 }
 const nav=document.querySelector('.top-nav');
 if(nav&&!nav.querySelector('.market-ux-mega')){
  const menu=document.createElement('details');menu.className='market-ux-mega';
  menu.innerHTML='<summary>التخصصات <span aria-hidden="true">⌄</span></summary><div class="market-ux-mega-panel">'+landing.map(([id,name])=>'<section><h2>'+esc(name)+'</h2>'+renderSpecialties(id)+'</section>').join('')+'</div>';
  nav.append(menu);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));
 }
 const drawer=document.querySelector('#drawer-nav');
 if(drawer&&!drawer.querySelector('.market-ux-drawer-specialties')){
  const panel=document.createElement('div');panel.className='market-ux-drawer-specialties';
  panel.innerHTML='<h3>اختر التخصص</h3>'+landing.map(([id,name])=>'<details><summary>'+esc(name)+'</summary><div>'+renderSpecialties(id)+'</div></details>').join('');
  drawer.append(panel);
 }
}
function enhance(){
 if(running)return;running=true;
 try{footerColumns();addFooterCards();addStoreGuidance();addTaxonomy();}
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
