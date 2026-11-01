// Route conversion for the public marketplace, independent of browser state.
const staticRoutes = Object.freeze({home:'/', categories:'/categories', studio:'/studio', partners:'/experiences/partnerships', journey:'/how-it-works', cart:'/cart', sitemap:'/sitemap'});
const visions = Object.freeze({showroom:'/experiences/stores', projects:'/experiences/contracting-services', studio:'/experiences/design'});
function fromLegacy(fragment) {
 const value=String(fragment||'').replace(/^#/,'');
 if (!value) return '/';
 const [name, query='']=value.split('?',2), params=new URLSearchParams(query);
 let path=staticRoutes[name];
 if(name==='vision'){path=visions[params.get('area')];if(path)params.delete('area');}
 if(name==='section'&&params.get('category')){path='/categories/'+encodeURIComponent(params.get('category'));params.delete('category');}
 if(name==='info'&&params.get('slug')){const slug=params.get('slug');path=slug==='how-to-buy'?'/how-to-buy':'/guides/'+encodeURIComponent(slug);params.delete('slug');}
 if(name==='owner'&&params.get('topic')){path='/business/'+encodeURIComponent(params.get('topic'));params.delete('topic');}
 if(name==='policy'&&params.get('slug')){path='/policies/'+encodeURIComponent(params.get('slug'));params.delete('slug');}
 if((name==='public-store'||name==='public-product')&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(params.get('slug')||'')){path=(name==='public-store'?'/stores/':'/product/')+encodeURIComponent(params.get('slug'));params.delete('slug');}
 if(name==='results')path='/search';
 if(name==='detail')path='/listing';
 if(name==='store')path='/store';
 if(!path)return null;
 const q=params.toString();return path+(q?'?'+q:'');
}
function toLegacy(pathname,search='') {
 let path=String(pathname||'/').replace(/\/$/,'')||'/';
 if(path==='/en')path='/';else if(path.startsWith('/en/'))path=path.slice(3);
 const params=new URLSearchParams(search);for(const key of [...params.keys()])if(/^utm_/i.test(key)||['gclid','gbraid','wbraid','fbclid','msclkid'].includes(key.toLowerCase()))params.delete(key);let name=Object.keys(staticRoutes).find(k=>staticRoutes[k]===path);
 if(path==='/experiences/stores'){name='vision';params.set('area','showroom');}
 if(path==='/experiences/contracting-services'){name='vision';params.set('area','projects');}
 if(path==='/experiences/design'){name='vision';params.set('area','studio');}
 let match=path.match(/^\/(categories|guides|business|policies)\/([^/]+)$/);
 if(match){name={categories:'section',guides:'info',business:'owner',policies:'policy'}[match[1]];try{params.set({categories:'category',guides:'slug',business:'topic',policies:'slug'}[match[1]],decodeURIComponent(match[2]));}catch{return null;}}
 const merchant=path.match(/^\/(stores|product)\/([A-Za-z0-9][A-Za-z0-9_-]{0,159})$/);if(merchant){name=merchant[1]==='stores'?'public-store':'public-product';params.set('slug',merchant[2]);}
 if(path==='/search')name='results';
 if(path==='/listing')name='detail';
 if(path==='/store')name='store';
 if(path==='/how-to-buy'){name='info';params.set('slug','how-to-buy');}
 if(!name)return null;
 const q=params.toString();return '#'+name+(q?'?'+q:'');
}

(function(){
 function prefix(path){return (location.pathname==='/en'||location.pathname.startsWith('/en/'))?(path==='/'?'/en/':'/en'+path):path;}
 function current(){return toLegacy(location.pathname,location.search)||'#home';}
 function syncHead(){const pathname=location.pathname==='/en'?'/en/':location.pathname;const clean=pathname.startsWith('/en/')?pathname.slice(3):pathname;const origin='https://app.bietalreef.ae';const paths={canonical:pathname,ar:clean,en:clean==='/'?'/en/':'/en'+clean};const canonical=document.querySelector('link[rel=canonical]');if(canonical)canonical.href=origin+paths.canonical;for(const a of document.querySelectorAll('link[rel=alternate][hreflang]')){if(a.hreflang==='ar-AE')a.href=origin+paths.ar;else if(a.hreflang==='en-AE')a.href=origin+paths.en;}const robots=document.querySelector('meta[name=robots]');if(robots)robots.content=['/search','/cart','/store','/listing'].includes(clean)?'noindex,follow':'index,follow,max-image-preview:large';}
 function navigate(value, replace=false){const target=fromLegacy(value);if(!target)return false;const dest=new URL(prefix(target),location.origin);for(const [key,val] of new URLSearchParams(location.search)){if((/^utm_/i.test(key)||['gclid','gbraid','wbraid','fbclid','msclkid'].includes(key.toLowerCase()))&&!dest.searchParams.has(key))dest.searchParams.append(key,val)}const next=dest.pathname+dest.search;if(location.pathname+location.search!==next){history[replace?'replaceState':'pushState'](null,'',next);syncHead();window.dispatchEvent(new Event('hashchange'));}return true;}
 window.marketLocation={get hash(){return current()},set hash(value){navigate(value)}};
 window.marketSetLanguage=function(lang){let path=location.pathname;if(path==='/en')path='/';else if(path.startsWith('/en/'))path=path.slice(3);let dest=lang==='en'?(path==='/'?'/en/':'/en'+path):path;if(/^\/(stores|product)\//.test(path)){location.assign(dest+location.search);return;}history.replaceState(null,'',dest+location.search+location.hash);syncHead();updateLinks()};
 if(location.hash){const target=fromLegacy(location.hash);if(target){const h=new URL(target,location.origin);const original=new URLSearchParams(location.search);for(const [k,v] of h.searchParams)original.set(k,v);history.replaceState(null,'',prefix(h.pathname)+(original.toString()?'?'+original:''));}}
 window.addEventListener('popstate',()=>{syncHead();updateLinks();window.dispatchEvent(new Event('hashchange'))});
 function updateLinks(){document.querySelectorAll('a[href^="#"],a[data-market-legacy]').forEach(a=>{let original=a.dataset.marketLegacy||a.getAttribute('href');if(a.dataset.drawerCity&&original.split('?')[0]==='#results'){const q=new URLSearchParams(original.split('?')[1]||'');q.set('city',a.dataset.drawerCity);original='#results?'+q;}let target=fromLegacy(original);if(target){a.dataset.marketLegacy=original;let href=prefix(target);if(a.getAttribute('href')!==href)a.setAttribute('href',href);}})}
 const observer=new MutationObserver(updateLinks);observer.observe(document.documentElement,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateLinks,{once:true});else updateLinks();
 document.addEventListener('click',function(e){const a=e.target.closest('a[data-market-legacy],a[href^="#"]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hasAttribute('download')||a.target)return;let legacy=a.dataset.marketLegacy||a.getAttribute('href'), target=fromLegacy(legacy);if(!target)return;e.preventDefault();e.stopImmediatePropagation();navigate(legacy);},true);
})();
