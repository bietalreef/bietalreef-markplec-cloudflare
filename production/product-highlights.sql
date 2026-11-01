-- Owner-authorized presentation copy for Arkleen's existing published products.
with content(slug,ar,en) as (values
  ('custom-wooden-kitchen',
   jsonb_build_array('توزيع الخزائن والأدراج ومواقع الأجهزة وفق مساحة الموقع وطريقة الاستخدام.','اختيار الخامة واللون والتشطيب والمفصلات والملحقات الداخلية.','مراجعة المقاسات والمخطط ونطاق التوريد والتركيب لتحديد السعر النهائي.'),
   jsonb_build_array('Cabinet, drawer and appliance layout tailored to the space and how it is used.','Choose the material, colour, finish, hinges and internal accessories.','Review measurements, plans, delivery and installation scope for a final quote.')),
  ('custom-wooden-wardrobe',
   jsonb_build_array('تصنيع وفق العرض والارتفاع والعمق المتاح في المساحة.','تخصيص الرفوف والأدراج وعلاقات الملابس والتقسيم الداخلي.','اختيار الأبواب المفصلية أو السحّاب والخامة واللون والإضاءة.'),
   jsonb_build_array('Made to suit the available width, height and depth.','Configure shelves, drawers, hanging space and internal organisation.','Choose hinged or sliding doors, materials, colours and lighting.')),
  ('custom-wooden-door',
   jsonb_build_array('يصنع حسب أبعاد فتحة الباب والتصميم المطلوب.','اختيار نوع الخشب أو القشرة واللون والتشطيب المناسب للمكان.','تحديد الإطار والإكسسوارات والعدد ومتطلبات التركيب قبل اعتماد السعر.'),
   jsonb_build_array('Made to the door opening and required design.','Choose timber or veneer, colour and finish to suit the interior.','Confirm the frame, hardware, quantity and installation needs before final pricing.'))
)
update public.provider_products p
set specifications=coalesce(p.specifications,'{}'::jsonb)||jsonb_build_object('highlights_ar',content.ar,'highlights_en',content.en)
from content,public.provider_public_profiles pub
where pub.slug='arkleen' and p.provider_id=pub.id and p.slug=content.slug and p.is_published
returning p.slug;
