// Tabs progressively enhance server-rendered store sections; the source HTML remains complete.
document.addEventListener('click',event=>{
 const photo=event.target.closest('[data-merchant-photo]');
 if(photo){
  const gallery=photo.closest('[data-merchant-gallery]'),feature=gallery?.querySelector('.merchant-feature');
  if(feature){feature.src=photo.dataset.merchantPhoto;gallery.querySelectorAll('[data-merchant-photo]').forEach(x=>x.setAttribute('aria-pressed',String(x===photo)))}
  return;
 }
 const tab=event.target.closest('[data-merchant-tab]');if(!tab)return;
 const root=tab.closest('[data-merchant-ssr]');if(!root)return;
 const selected=tab.dataset.merchantTab;
 root.querySelectorAll('[data-merchant-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===tab)));
 root.querySelectorAll('[data-merchant-panel]').forEach(x=>{x.hidden=x.dataset.merchantPanel!==selected});
 document.dispatchEvent(new CustomEvent('brx-merchant-tab',{detail:{selected}}));
});
function prepareProductDetails(){
 document.querySelectorAll('[data-product-details]:not([data-responsive-ready])').forEach(details=>{
  details.dataset.responsiveReady='true';if(window.matchMedia('(max-width: 720px)').matches)details.open=false;
  const summary=details.previousElementSibling;
  const syncSummary=()=>{if(summary?.classList.contains('merchant-product-summary'))summary.hidden=details.open};
  details.addEventListener('toggle',syncSummary);syncSummary();
 });
}
prepareProductDetails();
new MutationObserver(prepareProductDetails).observe(document.documentElement,{childList:true,subtree:true});
