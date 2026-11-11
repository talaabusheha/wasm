export interface Feature {
  id: string;
  title: string;
  iconName: 'countdown' | 'calendar' | 'rsvp' | 'location' | 'prayer' | 'gallery';
}

export const features: Feature[] = [
  { id: '1', title: 'عدّ تنازلي', iconName: 'countdown' },
  { id: '2', title: 'حفظ الموعد بالتقويم', iconName: 'calendar' },
  { id: '3', title: 'تأكيد الحضور', iconName: 'rsvp' },
  { id: '4', title: 'موقع القاعة', iconName: 'location' },
  { id: '5', title: 'آية / دعاء', iconName: 'prayer' },
  { id: '6', title: 'صور العرسان', iconName: 'gallery' },
];

