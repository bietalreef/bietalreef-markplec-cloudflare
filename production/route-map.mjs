// Route conversion for the public marketplace, independent of browser state.
const staticRoutes = Object.freeze({home:'/', categories:'/categories', studio:'/studio', partners:'/experiences/partnerships', journey:'/how-it-works', cart:'/cart', sitemap:'/sitemap'});
const visions = Object.freeze({showroom:'/experiences/stores', projects:'/experiences/contracting-services', studio:'/experiences/design'});
export function fromLegacy(fragment) {
 const value=String(fragment||'').replace(/^#/,'');
 if (!value) return '/';
 const [name, query='']=value.split('?',2), params=new URLSearchParams(query);
 let path=staticRoutes[name];
 if(name==='vision'){path=visions[params.get('area')];if(path)params.delete('area');}
 if(name==='section'&&params.get('category')){path='/categories/'+encodeURIComponent(params.get('category'));params.delete('category');}
 if(name==='info'&&params.get('slug')){const slug=params.get('slug');path=slug==='how-to-buy'?'/how-to-buy':'/guides/'+encodeURIComponent(slug);params.delete('slug');}
 if(name==='owner'&&params.get('topic')){path='/business/'+encodeURIComponent(params.get('topic'));params.delete('topic');}
 if(name==='policy'&&params.get('slug')){path='/policies/'+encodeURIComponent(params.get('slug'));params.delete('slug');}
 if(name==='public-product'&&/^[a-z0-9][a-z0-9-]{0,119}$/.test(params.get('store')||'')&&/^[a-z0-9][a-z0-9-]{0,159}$/.test(params.get('slug')||'')){path='/products/'+encodeURIComponent(params.get('store'))+'/'+encodeURIComponent(params.get('slug'));params.delete('store');params.delete('slug');}
 else if((name==='public-store'||name==='public-product')&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(params.get('slug')||'')){path=(name==='public-store'?'/stores/':'/product/')+encodeURIComponent(params.get('slug'));params.delete('slug');}
 if(name==='results')path='/search';
 if(name==='detail')path='/listing';
 if(name==='store')path='/store';
 if(!path)return null;
 const q=params.toString();return path+(q?'?'+q:'');
}
export function toLegacy(pathname,search='') {
 let path=String(pathname||'/').replace(/\/$/,'')||'/';
 if(path==='/en')path='/';else if(path.startsWith('/en/'))path=path.slice(3);
 const params=new URLSearchParams(search);for(const key of [...params.keys()])if(/^utm_/i.test(key)||['gclid','gbraid','wbraid','fbclid','msclkid'].includes(key.toLowerCase()))params.delete(key);let name=Object.keys(staticRoutes).find(k=>staticRoutes[k]===path);
 if(path==='/experiences/stores'){name='vision';params.set('area','showroom');}
 if(path==='/experiences/contracting-services'){name='vision';params.set('area','projects');}
 if(path==='/experiences/design'){name='vision';params.set('area','studio');}
 let match=path.match(/^\/(categories|guides|business|policies)\/([^/]+)$/);
 if(match){name={categories:'section',guides:'info',business:'owner',policies:'policy'}[match[1]];try{params.set({categories:'category',guides:'slug',business:'topic',policies:'slug'}[match[1]],decodeURIComponent(match[2]));}catch{return null;}}
 const merchant=path.match(/^\/(stores|product)\/([A-Za-z0-9][A-Za-z0-9_-]{0,159})$/);if(merchant){name=merchant[1]==='stores'?'public-store':'public-product';params.set('slug',merchant[2]);}
 const named=path.match(/^\/products\/([a-z0-9][a-z0-9-]{0,119})\/([a-z0-9][a-z0-9-]{0,159})$/);if(named){name='public-product';params.set('store',named[1]);params.set('slug',named[2]);}
 if(path==='/search')name='results';
 if(path==='/listing')name='detail';
 if(path==='/store')name='store';
 if(path==='/how-to-buy'){name='info';params.set('slug','how-to-buy');}
 if(!name)return null;
 const q=params.toString();return '#'+name+(q?'?'+q:'');
}
