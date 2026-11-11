export interface Design {
  id: string;
  name: string;
  tag: string;
  url: string;
  image: string;
}

// الكروت الحقيقية لـ وَسم فقط
export const designs: Design[] = [
  {
    id: 'swan',
    name: 'البجعة 🦢',
    tag: 'رومانسي',
    url: 'https://swan.wasminvites.com/',
    image: '/designs/swan.webp',
  },
  {
    id: 'royal',
    name: 'ملكي 👑',
    tag: 'فخم',
    url: 'https://royal.wasminvites.com/',
    image: '/designs/royal.webp',
  },
];
