// Tabs progressively enhance server-rendered store sections; the source HTML remains complete.
document.addEventListener('click',event=>{
 const tab=event.target.closest('[data-merchant-tab]');if(!tab)return;
 const root=tab.closest('[data-merchant-ssr]');if(!root)return;
 const selected=tab.dataset.merchantTab;
 root.querySelectorAll('[data-merchant-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===tab)));
 root.querySelectorAll('[data-merchant-panel]').forEach(x=>{x.hidden=x.dataset.merchantPanel!==selected});
 document.dispatchEvent(new CustomEvent('brx-merchant-tab',{detail:{selected}}));
});
