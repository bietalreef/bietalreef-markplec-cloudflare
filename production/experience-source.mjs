// Published editorial content comes from the shared database at request time.
// Keep a short last-known-good copy only to survive a temporary upstream failure.
const BR_XP_KEYS=Object.freeze({design:'studio',stores:'showroom','contracting-services':'projects',partnerships:'partner'});
let BR_XP_LAST=null,BR_XP_LAST_AT=0;
function BR_VALID_EXPERIENCE(p,slug){
 const text=x=>typeof x==='string'&&x.length>0&&x.length<=5000;
 const safe=x=>typeof x==='string'&&x.length<2048&&((x.startsWith('/')&&!x.startsWith('//')&&!x.includes('\\'))||/^https:\/\//i.test(x));
 if(!p||p.slug!==slug||!safe(p.image))return false;
 if(slug==='design'&&(!Array.isArray(p.heroSlides)||p.heroSlides.length!==2||!p.heroSlides.every(s=>safe(s.image)&&text(s.altAr)&&text(s.altEn)&&Array.isArray(s.points)&&s.points.length>0&&s.points.length<=6&&s.points.every(q=>Number.isFinite(q.x)&&q.x>=0&&q.x<=100&&Number.isFinite(q.y)&&q.y>=0&&q.y<=100&&safe(q.href)&&['ar','en'].every(l=>q[l]&&['label','title','body','action'].every(k=>text(q[l][k])))))))return false;
 if(slug==='design'&&(!p.video||!safe(p.video.src)||!safe(p.video.poster)||!['ar','en'].every(l=>p.video[l]&&text(p.video[l].title)&&text(p.video[l].description))))return false;
 return ['ar','en'].every(lang=>{const v=p[lang];return v&&['title','eyebrow','summary','intro','note','imageAlt','featuresTitle','visionTitle','visionText','galleryTitle'].every(k=>text(v[k]))&&['primary','secondary'].every(k=>v[k]&&text(v[k].label)&&safe(v[k].href))&&Array.isArray(v.features)&&v.features.length===3&&v.features.every(x=>text(x.title)&&text(x.body))&&Array.isArray(v.gallery)&&v.gallery.length>=2&&v.gallery.length<=6&&v.gallery.every(x=>safe(x.src)&&text(x.alt)&&text(x.title)&&text(x.body))})&&p.ar.gallery.length===p.en.gallery.length&&p.ar.gallery.every((x,i)=>x.src===p.en.gallery[i].src)&&p.ar.primary.href===p.en.primary.href&&p.ar.secondary.href===p.en.secondary.href;
}
async function BR_LOAD_EXPERIENCES(){
 try{
  const response=await fetch(MARKET_TAXONOMY_PROJECT+'/rest/v1/marketplace_experience_pages?select=slug,content,updated_at&status=eq.published',{headers:{apikey:MARKET_TAXONOMY_PUBLIC_KEY},signal:AbortSignal.timeout(6000),cf:{cacheTtl:30,cacheEverything:true}});
  if(!response.ok)throw Error('content unavailable');
  const rows=await response.json();if(!Array.isArray(rows))throw Error('invalid content');
  const pages={};for(const row of rows){const key=BR_XP_KEYS[row.slug];if(key&&BR_VALID_EXPERIENCE(row.content,row.slug))pages[key]={...row.content,updatedAt:row.updated_at||null};}
  if(Object.keys(pages).length!==4)throw Error('incomplete content');
  BR_XP_LAST=pages;BR_XP_LAST_AT=Date.now();return pages;
 }catch{return BR_XP_LAST&&Date.now()-BR_XP_LAST_AT<300000?BR_XP_LAST:null}
}
