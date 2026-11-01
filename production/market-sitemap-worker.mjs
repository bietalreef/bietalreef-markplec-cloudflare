if(liveHost&&url.pathname==='/sitemap.xml'){
 const [pages,marketPages]=await Promise.all([BR_LOAD_EXPERIENCES(),BR_LOAD_MARKET_SITEMAP()]);
 if(!marketPages)return new Response('Sitemap temporarily unavailable',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Retry-After':'30'}});
 const paths=BR_PUBLIC_PATHS.flatMap(p=>p==='/google-workspace-offer'?[p]:[p,p==='/'?'/en/':'/en'+p]);
 const entry=(p,updated,image,images=[])=>{
  let extra='';if(updated&&!Number.isNaN(Date.parse(updated)))extra+='<lastmod>'+new Date(updated).toISOString()+'</lastmod>';
  const list=[image,...(Array.isArray(images)?images.slice(0,20):[])].map(x=>BR_MARKET_URL(typeof x==='string'?x:x?.url)).filter((x,i,a)=>x&&a.indexOf(x)===i);
  for(const src of list)extra+='<image:image><image:loc>'+BR_ESC(src.startsWith('/')?'https://app.bietalreef.ae'+src:src)+'</image:loc></image:image>';
  return '<url><loc>https://app.bietalreef.ae'+BR_ESC(p)+'</loc>'+extra+'</url>';
 };
 const editorial=paths.map(p=>{const clean=p.startsWith('/en/')?p.slice(3):p,xp=pages&&Object.values(pages).find(x=>clean==='/experiences/'+x.slug),lang=p.startsWith('/en/')?'en':'ar';
  if(!xp)return entry(p,null,null);
  const imgs=[xp.image,...xp[lang].gallery.map(x=>x.src)].map(BR_MARKET_URL).filter((x,i,a)=>x&&a.indexOf(x)===i);
  let extra='';if(xp.updatedAt&&!Number.isNaN(Date.parse(xp.updatedAt)))extra+='<lastmod>'+new Date(xp.updatedAt).toISOString()+'</lastmod>';
  for(const src of imgs)extra+='<image:image><image:loc>'+BR_ESC(src.startsWith('/')?'https://app.bietalreef.ae'+src:src)+'</image:loc></image:image>';
  return '<url><loc>https://app.bietalreef.ae'+BR_ESC(p)+'</loc>'+extra+'</url>';
 }).join('');
 const merchants=marketPages.flatMap(x=>[entry(x.path,x.updated_at,x.image,x.images),entry('/en'+x.path,x.updated_at,x.image,x.images)]).join('');
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+editorial+merchants+'</urlset>';
 return new Response(request.method==='HEAD'?null:xml,{status:200,headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=60'}});
}
