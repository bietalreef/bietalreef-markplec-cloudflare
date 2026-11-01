-- Owner-requested updates to Arkleen's published merchant and product descriptions.
update public.provider_public_profiles
set tagline_ar='تصميم وتصنيع أعمال النجارة والديكور حسب المقاس',
    tagline_en='Custom carpentry and interior design',
    short_description_ar='تصميم وتصنيع المطابخ والخزائن والأبواب والأعمال الخشبية حسب الطلب.',
    short_description_en='Custom kitchens, wardrobes, interior doors and woodwork.',
    description_ar='أركلين لأعمال النجارة والتصميم الداخلي تقدم تصميم وتصنيع المطابخ الخشبية وخزائن الملابس والأبواب الداخلية والأثاث والديكورات الخشبية حسب المقاس. تبدأ الرحلة بمراجعة احتياجات العميل والمقاسات والخامات والتشطيبات، ثم الاتفاق على نطاق العمل والسعر والمدة والتوريد والتركيب قبل التنفيذ.',
    description_en='ARKLEEN Carpentry and Interior Design creates made-to-measure wooden kitchens, wardrobes, interior doors, furniture and decorative woodwork. Each request starts with a review of the customer’s requirements, measurements, materials and finishes, followed by agreement on scope, price, timing, delivery and installation.',
    seo_description_ar='أركلين لأعمال النجارة والتصميم الداخلي: مطابخ وخزائن وأبواب وأثاث خشبي حسب الطلب، مع خيارات للمقاسات والخامات والتشطيبات.',
    seo_description_en='ARKLEEN carpentry and interior design: made-to-order kitchens, wardrobes, doors and woodwork, tailored to your dimensions and finish.'
where slug='arkleen';

update public.provider_products p
set description_ar=replace(p.description_ar,' في العين وأبوظبي،','،'),
    description_en=replace(p.description_en,' in Al Ain and Abu Dhabi,',',')
from public.provider_public_profiles pub
where pub.slug='arkleen' and p.provider_id=pub.id and p.is_published
  and p.slug in ('custom-wooden-kitchen','custom-wooden-wardrobe','custom-wooden-door');
