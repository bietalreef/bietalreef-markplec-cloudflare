function BR_EXPERIENCE_SEO(page,en,canonical){
 const t=page[en?'en':'ar'];
 const image=page.image.startsWith('/')?'https://app.bietalreef.ae'+page.image:page.image;
 const data={'@context':'https://schema.org','@type':'WebPage',name:t.title,description:t.summary,url:canonical,inLanguage:en?'en-AE':'ar-AE',isPartOf:{'@type':'WebSite',name:en?'Biet Al Reef Marketplace':'سوق بيت الريف',url:en?'https://app.bietalreef.ae/en/':'https://app.bietalreef.ae/'},primaryImageOfPage:{'@type':'ImageObject',contentUrl:image,caption:t.imageAlt}};
 const json=JSON.stringify(data).replace(/</g,'\\u003c').replace(/&/g,'\\u0026');
 return '<meta property="og:type" content="website"><meta property="og:title" content="'+BR_ESC(t.title)+'"><meta property="og:description" content="'+BR_ESC(t.summary)+'"><meta property="og:url" content="'+BR_ESC(canonical)+'"><meta property="og:image" content="'+BR_ESC(image)+'"><meta property="og:image:alt" content="'+BR_ESC(t.imageAlt)+'"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">'+json+'</script>';
}
