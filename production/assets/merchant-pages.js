// Tabs progressively enhance server-rendered store sections; the source HTML remains complete.
document.addEventListener('click',event=>{
 const cardPhoto=event.target.closest('[data-card-photo]');
 if(cardPhoto){const card=cardPhoto.closest('.merchant-card'),image=card?.querySelector('.merchant-card-image');if(image){image.src=cardPhoto.dataset.cardPhoto;card.querySelectorAll('[data-card-photo]').forEach(x=>x.setAttribute('aria-pressed',String(x===cardPhoto)))}return}
 const photo=event.target.closest('[data-merchant-photo]'),step=event.target.closest('[data-gallery-step]');
 if(photo||step){
  const gallery=(photo||step).closest('[data-merchant-gallery]'),feature=gallery?.querySelector('.merchant-feature'),buttons=[...gallery.querySelectorAll('[data-merchant-photo]')];
  let chosen=photo;if(step&&buttons.length){const current=Math.max(0,buttons.findIndex(x=>x.getAttribute('aria-pressed')==='true'));chosen=buttons[(current+Number(step.dataset.galleryStep)+buttons.length)%buttons.length]}
  if(feature&&chosen){feature.src=chosen.dataset.merchantPhoto;buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===chosen)));const counter=gallery.querySelector('.merchant-gallery-counter');if(counter)counter.textContent=(buttons.indexOf(chosen)+1)+' / '+buttons.length}
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
