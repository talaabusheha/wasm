export interface Design {
  id: string;
  name: string;
  tag: string;
  url: string;
  image: string;
}

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
  {
    id: 'olive',
    name: 'زيتوني 🌿',
    tag: 'هادئ',
    url: 'https://wasminvites.com/demo/olive',
    image: '/designs/olive.webp',
  },
  {
    id: 'blush',
    name: 'زهري راقي 🌸',
    tag: 'ناعم',
    url: 'https://wasminvites.com/demo/blush',
    image: '/designs/blush.webp',
  },
  {
    id: 'classic-gold',
    name: '  ',
    tag: 'أنيق',
    url: 'https://wasminvites.com/demo/classic-gold',
    image: '/designs/royal-garden.webp',
  },
  // تصميم بـ url فارغ: يتم إخفاؤه تلقائياً حسب الشروط
  {
    id: 'pearl',
    name: 'لؤلؤي 🪞',
    tag: 'قريباً',
    url: '',
    image: '/designs/pearl.webp',
  },
];
