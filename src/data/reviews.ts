export interface Review {
  image: string;
  alt: string;
}

// ضعي لقطات الشاشة الحقيقية لآراء العرايس هنا (كل عنصر: مسار الصورة ووصف الصورة)
// مثال: { image: '/reviews/bride-1.webp', alt: 'رأي عروس بدعوتها' }
// إذا كانت هذه المصفوفة فارغة []، فلن يظهر قسم "آراء العرايس" نهائياً (لا عنوان ولا كروت فارغة).
export const reviews: Review[] = [];
