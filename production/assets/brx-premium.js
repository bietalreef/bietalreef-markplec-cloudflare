/* Biet Al Reef: UX premium mobile, cinematic 8s sequence */
let brxActive='products',brxTerm='',brxScheduled=false;
const brxTabs=[['products','▦','المنتجات'],['colors','◉','الألوان'],['items','↻','العناصر'],['scene','⌂','المشهد'],['save','▣','حفظ']];
function brxHome(){
 const root=document.querySelector('#content');if(!root||!['','#home','#categories'].includes(window.marketLocation.hash))return;
 const t=root.querySelector('.br-studio-teaser');
 if(t&&!t.hasAttribute('data-motion')){
  t.setAttribute('data-motion','8s');
  t.innerHTML='<div class="brx-film-copy"><small>BIET AL REEF · DESIGN STUDIO</small><h2>من فكرة لمساحتك… <em>إلى تصميم من اختيارك</em></h2><p>اختر غرفتك، أضف القطع، حرّك الأثاث وبدّل الألوان — كل خطوة في مساحة ثلاثية الأبعاد يمكنك تعديلها بنفسك.</p><a class="brx-film-cta" href="#studio">ابدأ تصميم مساحتك ←</a><div class="brx-film-benefits"><span>بدون تسجيل</span><span>معاينة 360°</span><span>تغيير الألوان</span></div></div><div class="brx-film" role="img" aria-label="عرض متحرك يوضح خطوات التصميم"><div class="brx-film-outside"><img loading="lazy" decoding="async" width="2000" height="1125" src="https://bietalreef.ae/hero-villa-1.webp" alt=""></div><div class="brx-film-inside"><img loading="lazy" decoding="async" src="/media/studio/studio-render-v4k.webp" alt=""></div><div class="brx-film-finish"><img loading="lazy" decoding="async" src="/media/studio/studio-render-warm-v4k.webp" alt=""></div><div class="brx-film-gradient"></div><div class="brx-film-caption cap1"><b>01</b> اختر المساحة</div><div class="brx-film-caption cap2"><b>02</b> رتّب الأثاث</div><div class="brx-film-caption cap3"><b>03</b> بدّل الألوان</div><div class="brx-film-demo">◈ <span>صمّمها بطريقتك</span> ↻</div><div class="brx-film-swatches"><span></span><span></span><span></span></div><div class="brx-film-brand">بيت الريف · تجربة التصميم</div><div class="brx-film-progress"><span></span></div></div>';
 }
 const hero=root.querySelector('.hero.hero-photo,.hero');
 if(hero&&!root.querySelector('.brx-mobile-hotspots')){
  hero.insertAdjacentHTML('afterend','<section class="brx-mobile-hotspots" aria-label="عناصر الغرفة القابلة للاستكشاف"><div><b>اكتشف تفاصيل المساحة</b><small>اضغط لعرض التفاصيل</small></div><nav><button type="button" class="scene-spot brx-spot" data-scene="sofa"><span>▰</span>الأثاث</button><button type="button" class="scene-spot brx-spot" data-scene="lighting"><span>✦</span>الإضاءة</button><button type="button" class="scene-spot brx-spot" data-scene="finishing"><span>◈</span>التشطيبات</button><button type="button" class="scene-spot brx-spot" data-scene="rug"><span>▧</span>الديكور</button></nav></section>');
 }
}
function brxPane(kind){
 if(kind==='products')return '<header><small>مكتبة بيت الريف</small><h3>أضف قطعة للمساحة</h3></header><label class="brx-mobile-search">⌕ <input data-brx-mobile-search type="search" placeholder="ابحث عن قطعة..." autocomplete="off"></label><div class="brx-mobile-products">'+(document.querySelector('#brx-list')?.innerHTML||'')+'</div>';
 if(kind==='colors')return '<header><small>حرية التخصيص</small><h3>الألوان والخامات</h3></header><div class="brx-mobile-swatches">'+(document.querySelector('#brx-palettes')?.innerHTML||'')+'</div>';
 if(kind==='items')return '<header><small>تعديل المجسم</small><h3>العنصر المحدد</h3></header><div class="brx-mobile-item">'+(document.querySelector('#brx-selected')?.innerHTML||'اختر قطعة من الغرفة')+'</div>';
 if(kind==='scene')return '<header><small>اختيار زاوية التصوير</small><h3>المشهد والكاميرا</h3></header><div class="brx-mobile-commands"><button data-brx-view="iso">منظور ثلاثي الأبعاد</button><button data-brx-view="front">عرض أمامي</button><button data-brx-view="top">مشهد علوي</button><button data-brx="reset-camera">ضبط المشهد</button><button data-brx-zoom="in">تقريب +</button><button data-brx-zoom="out">إبعاد −</button></div>';
 return '<header><small>احتفظ بالتصميم</small><h3>حفظ ومشاركة</h3></header><div class="brx-mobile-commands"><button data-brx="save">حفظ على الجهاز</button><button data-brx="capture">تنزيل صورة</button><button data-brx="export">قائمة القطع</button><button data-brx="undo">تراجع</button></div><p>الحفظ على جهازك دون حساب، وقطع التصميم ليست عروض بيع فعلية.</p>';
}

function brxMobileShow(kind,expand=true){
 const bar=document.querySelector('.brx-mobile-dock');if(!bar)return;
 if(expand&&brxActive===kind&&bar.classList.contains('brx-panel-open')){brxClosePanel();return}
 brxActive=kind;
 bar.classList.toggle('brx-panel-open',expand);
 bar.querySelectorAll('[data-brx-tab]').forEach(b=>b.setAttribute('aria-selected',String(expand&&b.dataset.brxTab===kind)));
 const panel=bar.querySelector('.brx-mobile-panel');panel.innerHTML=brxPane(kind);
 panel.setAttribute('aria-hidden',String(!expand));
 if(!panel.querySelector('[data-brx-panel-close]'))panel.insertAdjacentHTML('afterbegin','<button type="button" class="brx-panel-close" aria-label="إغلاق الأدوات" data-brx-panel-close>×</button>');
 if(kind==='products'&&brxTerm){const i=panel.querySelector('[data-brx-mobile-search]');if(i)i.value=brxTerm;brxFilter()}
}
function brxClosePanel(){
 const bar=document.querySelector('.brx-mobile-dock');if(!bar)return;
 bar.classList.remove('brx-panel-open');
 bar.querySelector('.brx-mobile-panel')?.setAttribute('aria-hidden','true');
 bar.querySelectorAll('[data-brx-tab]').forEach(b=>b.setAttribute('aria-selected','false'));
}
function brxFilter(){
 document.querySelectorAll('.brx-mobile-products .brx-product').forEach(el=>el.hidden=!!brxTerm&&!(el.textContent||'').includes(brxTerm));
}
function brxStudio(){
 const studio=document.querySelector('#brx-studio');if(!studio)return;
 const workspace=studio.querySelector('.brx-workspace');const bar=studio.querySelector('.brx-workbar');if(bar&&!bar.querySelector('.brx-quick-back'))bar.insertAdjacentHTML('afterbegin','<a class="brx-quick-back" href="#home" aria-label="العودة للسوق">← السوق</a><span class="brx-studio-mark"><img src="https://bietalreef.ae/icons/logo-512.webp" alt="" width="30" height="30"><strong>بيت الريف</strong><small>استوديو التصميم</small></span>');
 if(workspace&&!workspace.querySelector('.brx-mobile-dock')){
  const viewport=workspace.querySelector('.brx-viewport');if(viewport&&!viewport.querySelector('.brx-floating-camera'))viewport.insertAdjacentHTML('beforeend','<div class="brx-floating-camera" aria-label="زوايا العرض"><button type="button" data-brx-view="top" title="عرض علوي">⌗ <small>علوي</small></button><button type="button" data-brx-view="iso" title="عرض ثلاثي الأبعاد">◈ <small>3D</small></button><button type="button" data-brx-zoom="in" title="تقريب">＋</button><button type="button" data-brx-zoom="out" title="إبعاد">－</button></div>');
  const el=document.createElement('div');el.className='brx-mobile-dock';
  el.innerHTML='<div class="brx-mobile-tabs" role="tablist" aria-label="أدوات التصميم">'+brxTabs.map(t=>'<button type="button" role="tab" aria-selected="'+String(t[0]===brxActive)+'" data-brx-tab="'+t[0]+'"><span>'+t[1]+'</span><b>'+t[2]+'</b></button>').join('')+'</div><div class="brx-mobile-panel" role="tabpanel" aria-live="polite"></div>';
  workspace.querySelector('.brx-footer-tools')?.before(el);
  brxMobileShow(brxActive,false);
 }
}
function brxUpdate(){brxHome();brxStudio()}
function brxSchedule(){if(brxScheduled)return;brxScheduled=true;requestAnimationFrame(()=>{brxScheduled=false;brxUpdate()})}
const host=document.querySelector('#content');
if(host)new MutationObserver(records=>{
 const st=document.querySelector('#brx-studio');
 if(st){
  const refreshItems=records.some(r=>r.target?.closest?.('#brx-selected'));
  const refreshColors=records.some(r=>r.target?.closest?.('#brx-palettes'));
  if((brxActive==='items'&&refreshItems)||(brxActive==='colors'&&refreshColors)){
   const panel=st.querySelector('.brx-mobile-panel');
   if(panel)panel.innerHTML=brxPane(brxActive);
  }
 }
 if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.hero,.br-studio-teaser,#brx-studio')||n.querySelector?.('.hero,.br-studio-teaser,#brx-studio')))))brxSchedule();
}).observe(host,{subtree:true,childList:true});
document.addEventListener('click',e=>{
 const closer=e.target.closest('[data-brx-panel-close]');if(closer){brxClosePanel();return}
 const tab=e.target.closest('[data-brx-tab]');if(tab){brxMobileShow(tab.dataset.brxTab);return}
 const view=e.target.closest('[data-brx-view]');if(view){window.dispatchEvent(new CustomEvent('brx-camera-control',{detail:{view:view.dataset.brxView}}));return}
 const zoom=e.target.closest('[data-brx-zoom]');if(zoom){window.dispatchEvent(new CustomEvent('brx-camera-control',{detail:{zoom:zoom.dataset.brxZoom==='in'?-1:1}}));return}
 if(e.target.closest('.brx-mobile-products [data-brx-add]'))setTimeout(()=>brxClosePanel(),180);
 else if(e.target.closest('.brx-mobile-panel [data-brx-color],.brx-mobile-panel [data-brx]'))setTimeout(()=>brxMobileShow(brxActive),180);
});
document.addEventListener('input',e=>{if(e.target.matches('[data-brx-mobile-search]')){brxTerm=e.target.value.trim();brxFilter()}});
window.addEventListener('hashchange',brxSchedule);
document.addEventListener('DOMContentLoaded',brxSchedule);
brxSchedule();
