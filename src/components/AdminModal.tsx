import React, { useState } from 'react';
import { Design } from '../data/designs';
import { checkAuth, setAuth, compressImage, resetStoredDesigns } from '../utils/designsStorage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  designs: Design[];
  onUpdateDesigns: (newDesigns: Design[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  designs,
  onUpdateDesigns,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAuth());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // New design form state
  const [name, setName] = useState('');
  const [tag, setTag] = useState('جديد');
  const [url, setUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'wasm' && password.trim() === '2005') {
      setAuth(true);
      setIsAuthenticated(true);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setAuth(false);
    setIsAuthenticated(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setFormError('');
      const compressed = await compressImage(file, 500);
      setImagePreview(compressed);
      setImageUrlInput('');
    } catch {
      setFormError('حدث خطأ أثناء تحميل الصورة، يرجى تجربة صورة أخرى');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleAddDesign = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الكرت');
      return;
    }

    const finalImage = imagePreview.trim() || imageUrlInput.trim();
    if (!finalImage) {
      setFormError('يرجى اختيار صورة للكرت من جهازك أو وضع رابط الصورة');
      return;
    }

    // Default url if empty
    const finalUrl = url.trim() || 'https://wasminvites.com/';
    const finalTag = tag.trim() || 'فخم';

    const newDesign: Design = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      tag: finalTag,
      url: finalUrl,
      image: finalImage,
    };

    // Add to the top of designs
    const updated = [newDesign, ...designs];
    onUpdateDesigns(updated);

    // Reset form
    setName('');
    setImagePreview('');
    setImageUrlInput('');
    setUrl('');
    setTag('جديد');
    setSuccessMessage('تمت إضافة الكرت بنجاح وحفظه في الموقع! ✨');

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleDeleteDesign = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكرت؟')) {
      const updated = designs.filter((d) => d.id !== id);
      onUpdateDesigns(updated);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('هل تريد استعادة قائمة الكروت الافتراضية؟')) {
      const reset = resetStoredDesigns();
      onUpdateDesigns(reset);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-cream rounded-3xl border border-sand shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-beige border-b border-sand">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <h2 className="font-arabic font-bold text-base text-brown">
              {isAuthenticated ? 'لوحة تحكم موظف وسم' : 'تسجيل دخول موظف وسم'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-brown-muted hover:text-brown hover:bg-cream border border-sand/60 transition-colors"
            aria-label="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto no-scrollbar space-y-4">
          {!isAuthenticated ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 py-2">
              <p className="text-xs text-brown-muted font-arabic text-center leading-relaxed">
                هذه اللوحة مخصصة لإدارة كروت وتصاميم وسم
              </p>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-arabic text-center">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-arabic font-bold text-brown mb-1.5">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="wasm"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige border border-sand text-brown placeholder-brown-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-arabic font-bold text-brown mb-1.5">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige border border-sand text-brown placeholder-brown-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gold-dark hover:bg-gold text-white font-arabic font-bold text-sm shadow-soft transition-all active:scale-[0.98]"
              >
                تسجيل الدخول
              </button>
            </form>
          ) : (
            /* Management Dashboard */
            <div className="space-y-5">
              {/* Add New Card Section */}
              <div className="p-4 rounded-2xl bg-beige border border-sand space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-arabic font-bold text-sm text-brown flex items-center gap-1.5">
                    <span>✨</span>
                    <span>إضافة كرت جديد</span>
                  </h3>
                </div>

                {successMessage && (
                  <div className="p-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-arabic text-center animate-fade-in">
                    {successMessage}
                  </div>
                )}

                {formError && (
                  <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-arabic text-center">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleAddDesign} className="space-y-3">
                  {/* Card Name */}
                  <div>
                    <label className="block text-xs font-arabic font-medium text-brown mb-1">
                      اسم الكرت *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: البجعة 🦢 أو الملكي 👑"
                      className="w-full px-3 py-2 rounded-xl bg-cream border border-sand text-brown text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                      required
                    />
                  </div>

                  {/* Card Image */}
                  <div>
                    <label className="block text-xs font-arabic font-medium text-brown mb-1">
                      صورة الكرت *
                    </label>

                    {/* Image Upload Button */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-sand bg-cream hover:bg-beige cursor-pointer transition-colors text-xs font-arabic text-brown-muted">
                        <span>📷</span>
                        <span>{isProcessingImage ? 'جارِ معالجة الصورة...' : 'اختاري صورة من جهازك / موبايلك'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isProcessingImage}
                        />
                      </label>

                      {/* Or image URL input */}
                      <input
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => {
                          setImageUrlInput(e.target.value);
                          if (e.target.value) setImagePreview('');
                        }}
                        placeholder="أو اكتبي رابط الصورة: https://..."
                        dir="ltr"
                        className="w-full px-3 py-1.5 rounded-lg bg-cream border border-sand text-brown text-xs placeholder-brown-muted/50 focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    {/* Image Preview */}
                    {(imagePreview || imageUrlInput) && (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-cream border border-sand">
                        <img
                          src={imagePreview || imageUrlInput}
                          alt="معاينة الصورة"
                          className="w-12 h-16 object-cover rounded-lg border border-sand"
                        />
                        <div className="text-[11px] text-brown-muted font-arabic">
                          <p className="font-medium text-brown">تم اختيار الصورة بنجاح</p>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setImageUrlInput('');
                            }}
                            className="text-red-600 hover:underline text-[10px] mt-0.5"
                          >
                            إلغاء الصورة ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Demo URL */}
                  <div>
                    <label className="block text-xs font-arabic font-medium text-brown mb-1">
                      رابط الدعوة (اختياري)
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://swan.wasminvites.com/"
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl bg-cream border border-sand text-brown text-xs placeholder-brown-muted/50 focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-xs font-arabic font-medium text-brown mb-1">
                      التاج / التصنيف
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {['فخم', 'رومانسي', 'ناعم', 'ملكي', 'جديد'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTag(preset)}
                          className={`text-[10px] font-arabic px-2.5 py-0.5 rounded-full border transition-colors ${
                            tag === preset
                              ? 'bg-gold-dark text-white border-gold-dark'
                              : 'bg-cream text-brown-muted border-sand hover:border-gold'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingImage}
                    className="w-full py-2.5 px-4 rounded-xl bg-gold-dark hover:bg-gold text-white font-arabic font-bold text-xs sm:text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    حفظ وإضافة الكرت للموقع ✨
                  </button>
                </form>
              </div>

              {/* Existing Cards Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-arabic font-bold text-xs text-brown">
                    الكروت المعروضة حالياً ({designs.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[10px] font-arabic text-brown-muted hover:text-red-700 underline"
                  >
                    استعادة الأصل
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-beige border border-sand gap-2"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {design.image ? (
                          <img
                            src={design.image}
                            alt={design.name}
                            className="w-8 h-12 object-cover rounded-md border border-sand/60 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-12 bg-cream rounded-md border border-sand/60 flex items-center justify-center text-xs shrink-0">
                            💌
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-arabic font-bold text-xs text-brown truncate">
                            {design.name}
                          </p>
                          <span className="text-[10px] text-brown-muted font-arabic">
                            {design.tag}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteDesign(design.id)}
                        className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-[10px] font-arabic shrink-0"
                        title="حذف هذا الكرت"
                      >
                        حذف 🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-sand flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-arabic text-brown-muted hover:text-red-700 flex items-center gap-1"
                >
                  <span>تسجيل خروج</span>
                </button>
                <span className="text-[10px] text-brown-muted font-latin">v1.0 • WASM Admin</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

