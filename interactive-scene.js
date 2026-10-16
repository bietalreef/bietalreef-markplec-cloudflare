// Visual discovery hotspots are category guides, NOT listed products.
// Real marketplace items must be supplied by the existing publication API only
// when channel=souq and publication=approved, without attaching customer identity.
export const sceneItems = [
  {
    id: 'sofa', label: 'الأريكة', kind: 'product', kindLabel: 'منتج',
    title: 'مساحة تعكس ذوقك', detail: 'استكشف الأرائك والأثاث المناسب لمساحتك.',
    action: 'استكشف الأثاث', href: '#results?type=product&category=furniture',
    coords: {wide: [64, 63], mobile: [48, 69]},
  },
  {
    id: 'lighting', label: 'الإضاءة', kind: 'product', kindLabel: 'منتج',
    title: 'إضاءة تغيّر الأجواء', detail: 'تعرف على أفكار إضاءة تضيف لمسة خاصة لبيتك.',
    action: 'استكشف الإضاءة', href: '#results?type=product&category=decor',
    coords: {wide: [11, 34], mobile: [16, 30]},
  },
  {
    id: 'finishing', label: 'الجدران والتشطيبات', kind: 'service', kindLabel: 'خدمة',
    title: 'تجديد يبدأ من التفاصيل', detail: 'ابحث عن خدمات التصميم والدهان والتشطيبات.',
    action: 'استكشف الخدمات', href: '#results?type=service&category=construction',
    coords: {wide: [65, 26], mobile: [76, 28]},
  },
  {
    id: 'rug', label: 'السجاد والديكور', kind: 'offer', kindLabel: 'عروض',
    title: 'لمسة تكمل المكان', detail: 'تصفح العروض المتاحة على مستلزمات المنزل عند نشرها.',
    action: 'شاهد العروض', href: '#results?type=offer',
    coords: {wide: [47, 85], mobile: [53, 84]},
  },
];
export const sceneStatus = 'discovery-only'; // No inventory, availability, price, or discount claims.
