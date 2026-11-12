import React, { useState, useEffect } from 'react';
import { Design } from '../data/designs';
import { compressImage, resetStoredDesigns } from '../utils/designsStorage';
import {
  addDesignToService,
  updateDesignInService,
  deleteDesignFromService,
  reorderDesignsInService,
  fetchDesigns,
} from '../utils/designsService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured,
} from '../utils/supabaseClient';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  designs: Design[];
  onUpdateDesigns: (newDesigns: Design[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  designs = [],
  onUpdateDesigns,
}) => {
  const safeDesigns = Array.isArray(designs) ? designs : [];
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('wasm_auth_session') === 'true';
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab: 'cards' or 'supabase'
  const [activeTab, setActiveTab] = useState<'cards' | 'supabase'>('cards');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [url, setUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Supabase Config State
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [sbStatus, setSbStatus] = useState<string>('');
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedSortSql, setCopiedSortSql] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSbUrl(cfg.url);
    setSbKey(cfg.key);
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'wasm' && password.trim() === '2005') {
      try {
        sessionStorage.setItem('wasm_auth_session', 'true');
      } catch {}
      setIsAuthenticated(true);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('wasm_auth_session');
    } catch {}
    setIsAuthenticated(false);
    handleCancelEdit();
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

  // Start editing a design
  const handleStartEdit = (design: Design) => {
    setEditingId(design.id);
    setName(design.name);
    setUrl(design.url);
    setTag(design.tag || '');
    setImagePreview(design.image);
    setImageUrlInput('');
    setFormError('');
    setSuccessMessage('');
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setUrl('');
    setTag('');
    setImagePreview('');
    setImageUrlInput('');
    setFormError('');
  };

  // Save (Create or Update)
  const handleSaveDesign = async (e: React.FormEvent) => {
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

    if (!url.trim()) {
      setFormError('يرجى إدخال رابط الدعوة (إجباري)');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    const finalTag = tag.trim();

    if (editingId) {
      // Update existing design
      const updatedDesign: Design = {
        id: editingId,
        name: name.trim(),
        tag: finalTag,
        url: finalUrl,
        image: finalImage,
      };

      const updated = await updateDesignInService(updatedDesign, designs);
      onUpdateDesigns(updated);
      setSuccessMessage('تم تعديل وحفظ الكرت بنجاح');
      setEditingId(null);
    } else {
      // Add new design
      const newDesign: Design = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        tag: finalTag,
        url: finalUrl,
        image: finalImage,
      };

      const updated = await addDesignToService(newDesign, designs);
      onUpdateDesigns(updated);
      setSuccessMessage('تمت إضافة الكرت بنجاح وحفظه في الموقع والسحابة');
    }

    // Reset form
    setName('');
    setImagePreview('');
    setImageUrlInput('');
    setUrl('');
    setTag('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  // Delete a design
  const handleDeleteDesign = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكرت؟')) {
      if (editingId === id) {
        handleCancelEdit();
      }
      const updated = await deleteDesignFromService(id, designs);
      onUpdateDesigns(updated);
    }
  };

  // Clear all designs
  const handleResetToDefault = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الكروت؟')) {
      handleCancelEdit();
      const reset = resetStoredDesigns();
      onUpdateDesigns(reset);
    }
  };

  const handleCopyDesigns = () => {
    if (designs.length === 0) return;
    const jsonStr = JSON.stringify(designs, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(sbUrl, sbKey);
    setSbStatus('جارِ الاتصال ومزامنة الكروت...');

    const fresh = await fetchDesigns();
    onUpdateDesigns(fresh);
    setSbStatus('تم الاتصال والمزامنة السحابية بنجاح. أي كرت تضيفينه الآن سيظهر في كل الأجهزة.');

    setTimeout(() => {
      setSbStatus('');
    }, 5000);
  };

  const sortSqlCode = `alter table public.designs add column if not exists sort_order integer default 0;`;

  const copySortSqlToClipboard = () => {
    navigator.clipboard.writeText(sortSqlCode);
    setCopiedSortSql(true);
    setTimeout(() => setCopiedSortSql(false), 3000);
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const newList = [...designs];
    const item = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = item;

    onUpdateDesigns(newList);
    const updated = await reorderDesignsInService(newList);
    onUpdateDesigns(updated);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= designs.length - 1) return;
    const newList = [...designs];
    const item = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = item;

    onUpdateDesigns(newList);
    const updated = await reorderDesignsInService(newList);
    onUpdateDesigns(updated);
  };

  const sqlCode = `-- أنشئي هذا الجدول في Supabase > SQL Editor:
create table public.designs (
  id text primary key,
  name text not null,
  tag text default '',
  url text not null,
  image text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إذا كان الجدول منشأ لديك مسبقاً، نفذي هذا السطر لإضافة خاصية الترتيب:
alter table public.designs add column if not exists sort_order integer default 0;

-- السماح بالقراءة والإضافة لجميع الأجهزة
alter table public.designs enable row level security;
create policy "Allow all read" on public.designs for select using (true);
create policy "Allow all insert" on public.designs for insert with check (true);
create policy "Allow all update" on public.designs for update using (true);
create policy "Allow all delete" on public.designs for delete using (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const isConnected = isSupabaseConfigured();

  if (!isOpen) return null;

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gold-dark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 className="font-arabic font-bold text-base text-brown">
              {isAuthenticated ? 'لوحة تحكم موظف وسم' : 'تسجيل دخول موظف وسم'}
            </h2>
          </div>
          <button
            onClick={() => {
              handleCancelEdit();
              onClose();
            }}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-brown-muted hover:text-brown hover:bg-cream border border-sand/60 transition-colors"
            aria-label="إغلاق النافذة"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-brown-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
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
            <div className="space-y-4">
              {/* Tabs: Cards or Supabase Sync */}
              <div className="flex rounded-xl bg-beige p-1 border border-sand">
                <button
                  type="button"
                  onClick={() => setActiveTab('cards')}
                  className={`flex-1 py-1.5 text-xs font-arabic font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'cards'
                      ? 'bg-cream text-brown shadow-xs'
                      : 'text-brown-muted hover:text-brown'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                  <span>إدارة الكروت</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('supabase')}
                  className={`flex-1 py-1.5 text-xs font-arabic font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'supabase'
                      ? 'bg-cream text-brown shadow-xs'
                      : 'text-brown-muted hover:text-brown'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                  </svg>
                  <span>مزامنة السحابة</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-sand'
                    }`}
                  ></span>
                </button>
              </div>

              {activeTab === 'supabase' ? (
                /* Supabase Settings Tab */
                <div className="p-4 rounded-2xl bg-beige border border-sand space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-arabic font-bold text-sm text-brown flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-gold-dark"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                      </svg>
                      <span>ربط السحابة (Supabase)</span>
                    </h3>
                    <span
                      className={`text-[10px] font-arabic px-2 py-0.5 rounded-full border ${
                        isConnected
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-sand/40 text-brown-muted border-sand'
                      }`}
                    >
                      {isConnected ? 'متصل بالسحابة' : 'غير متصل بعد'}
                    </span>
                  </div>

                  <p className="text-[11px] text-brown-muted font-arabic leading-relaxed">
                    عند إدخال بيانات مشروعكِ في Supabase، ستتزامن الكروت تلقائياً وتظهر على الجوال واللابتوب وكل زوار الموقع في نفس الثانية!
                  </p>

                  {sbStatus && (
                    <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-arabic text-center">
                      {sbStatus}
                    </div>
                  )}

                  <form onSubmit={handleSaveSupabase} className="space-y-3">
                    <div>
                      <label className="block text-xs font-arabic font-medium text-brown mb-1">
                        Project URL (رابط المشروع)
                      </label>
                      <input
                        type="url"
                        value={sbUrl}
                        onChange={(e) => setSbUrl(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl bg-cream border border-sand text-brown text-xs font-latin focus:outline-none focus:ring-1 focus:ring-gold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-arabic font-medium text-brown mb-1">
                        Anon / Public API Key (مفتاح الـ API)
                      </label>
                      <input
                        type="text"
                        value={sbKey}
                        onChange={(e) => setSbKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl bg-cream border border-sand text-brown text-xs font-latin focus:outline-none focus:ring-1 focus:ring-gold"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-gold-dark hover:bg-gold text-white font-arabic font-bold text-xs sm:text-sm shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>حفظ وتفعيل الاتصال السحابي</span>
                    </button>
                  </form>

                  {/* Quick Migration for Sort Order */}
                  <div className="pt-2 border-t border-sand/70">
                    <div className="p-3 rounded-2xl bg-gold/10 border border-gold/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-arabic font-bold text-brown">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-gold-dark"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <polyline points="19 12 12 19 5 12" />
                        </svg>
                        <span>تفعيل خاصية ترتيب الكروت في Supabase</span>
                      </div>
                      <p className="text-[11px] font-arabic text-brown-muted leading-relaxed">
                        إذا كنتِ أنشأتِ الجدول سابقاً، انسخي هذا السطر ونفذيه في Supabase &gt; SQL Editor ليتم حفظ الترتيب تلقائياً في السحابة:
                      </p>
                      <code
                        dir="ltr"
                        className="block p-2 rounded-xl bg-brown text-cream text-[10px] font-mono select-all overflow-x-auto"
                      >
                        {sortSqlCode}
                      </code>
                      <button
                        type="button"
                        onClick={copySortSqlToClipboard}
                        className="w-full py-1.5 rounded-xl bg-cream border border-sand text-xs font-arabic text-brown hover:bg-sand/30 font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5 text-brown-muted"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        <span>{copiedSortSql ? 'تم نسخ سطر الترتيب بنجاح' : 'نسخ كود الترتيب (SQL)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* SQL Guide Toggle */}
                  <div className="pt-2 border-t border-sand/70">
                    <button
                      type="button"
                      onClick={() => setShowSqlGuide(!showSqlGuide)}
                      className="text-[11px] font-arabic text-gold-dark hover:underline flex items-center justify-between w-full"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                        <span>كود إنشاء جدول الكروت بالكامل من الصفر</span>
                      </span>
                      <span>{showSqlGuide ? '▲' : '▼'}</span>
                    </button>

                    {showSqlGuide && (
                      <div className="mt-2 space-y-2">
                        <pre
                          dir="ltr"
                          className="p-2.5 rounded-xl bg-brown text-cream text-[10px] font-mono overflow-x-auto max-h-36 no-scrollbar"
                        >
                          {sqlCode}
                        </pre>
                        <button
                          type="button"
                          onClick={copySqlToClipboard}
                          className="w-full py-1.5 rounded-lg bg-cream border border-sand text-[11px] font-arabic text-brown hover:bg-sand/30 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5 text-brown-muted"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                          <span>{copiedSql ? 'تم نسخ الكود بنجاح' : 'نسخ كود الـ SQL بالكامل'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Cards Management Tab */
                <>
                  {/* Form Section (Add or Edit) */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      editingId
                        ? 'bg-gold/10 border-gold shadow-sm'
                        : 'bg-beige border border-sand'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-arabic font-bold text-sm text-brown flex items-center gap-1.5">
                        {editingId ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-gold-dark"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-gold-dark"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        )}
                        <span>{editingId ? 'تعديل بيانات الكرت' : 'إضافة كرت جديد'}</span>
                      </h3>
                      {editingId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-[11px] font-arabic text-brown-muted hover:text-brown border border-sand px-2 py-0.5 rounded-lg bg-cream transition-colors flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3 text-brown-muted"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                          <span>إلغاء التعديل</span>
                        </button>
                      )}
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

                    <form onSubmit={handleSaveDesign} className="space-y-3">
                      {/* Card Name */}
                      <div>
                        <label className="block text-xs font-arabic font-medium text-brown mb-1">
                          اسم الكرت *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="مثال: البجعة أو الملكي"
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-brown-muted"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span>
                              {isProcessingImage
                                ? 'جارِ معالجة الصورة...'
                                : 'اختاري صورة من جهازك / موبايلك'}
                            </span>
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
                                className="text-red-600 hover:underline text-[10px] mt-0.5 flex items-center gap-1"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-2.5 h-2.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                                <span>تغيير الصورة</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Demo URL (Required) */}
                      <div>
                        <label className="block text-xs font-arabic font-medium text-brown mb-1">
                          رابط الدعوة * (إجباري)
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://swan.wasminvites.com/"
                          dir="ltr"
                          className="w-full px-3 py-2 rounded-xl bg-cream border border-sand text-brown text-xs placeholder-brown-muted/50 focus:outline-none focus:ring-1 focus:ring-gold"
                          required
                        />
                      </div>

                      {/* Tag / Type (Optional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-arabic font-medium text-brown">
                            نوع الكرت / التاج (اختياري)
                          </label>
                          {tag && (
                            <button
                              type="button"
                              onClick={() => setTag('')}
                              className="text-[10px] text-red-600 hover:underline font-arabic flex items-center gap-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-2.5 h-2.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                              <span>بدون نوع</span>
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {['فخم', 'رومانسي', 'ناعم', 'ملكي', 'جديد'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setTag(tag === preset ? '' : preset)}
                              className={`text-[10px] font-arabic px-2.5 py-1 rounded-full border transition-colors ${
                                tag === preset
                                  ? 'bg-gold-dark text-white border-gold-dark shadow-xs'
                                  : 'bg-cream text-brown-muted border-sand hover:border-gold'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          placeholder="أو اكتبي نوعاً مخصصاً (اختياري)"
                          className="w-full px-3 py-1.5 rounded-lg bg-cream border border-sand text-brown text-xs placeholder-brown-muted/50 focus:outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>

                      {/* Submit & Cancel Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={isProcessingImage}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gold-dark hover:bg-gold text-white font-arabic font-bold text-xs sm:text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {editingId ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>حفظ التعديلات</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              <span>حفظ وإضافة الكرت للموقع</span>
                            </span>
                          )}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="py-2.5 px-3 rounded-xl bg-cream border border-sand text-brown font-arabic text-xs sm:text-sm hover:bg-sand/30 transition-colors"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Cards Management List (Edit & Delete side by side) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-arabic font-bold text-xs text-brown">
                        الكروت المضافة حالياً ({safeDesigns.length})
                      </h4>
                      {safeDesigns.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyDesigns}
                            className="text-[10px] font-arabic text-gold-dark hover:underline flex items-center gap-1 border border-gold/40 px-2 py-0.5 rounded-md bg-gold/10"
                            title="نسخ كود الكروت لنشرها على جميع الأجهزة"
                          >
                            <span>
                              {copiedSuccess ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3 text-green-700"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>تم النسخ بنجاح</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                  </svg>
                                  <span>نسخ الكروت</span>
                                </span>
                              )}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="text-[10px] font-arabic text-brown-muted hover:text-red-700 underline"
                          >
                            مسح الكل
                          </button>
                        </div>
                      )}
                    </div>

                    {safeDesigns.length > 1 && (
                      <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/30 flex items-center gap-2 text-[11px] font-arabic text-brown leading-relaxed">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-gold-dark shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>
                          استخدمي أزرار <strong>(▲ / ▼)</strong> لتحديد ترتيب ظهور الكروت. الكرت رقم <strong>#1</strong> هو أول كرت سيظهر للزوار في واجهة الموقع!
                        </span>
                      </div>
                    )}

                    {safeDesigns.length === 0 ? (
                      <div className="p-4 rounded-xl bg-cream border border-sand/60 text-center">
                        <p className="text-xs font-arabic text-brown-muted leading-relaxed">
                          لا توجد أي كروت مضافة حالياً. يمكنكِ إضافة كرتكِ الأول الآن من النموذج بالأعلى.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
                        {safeDesigns.map((design, index) => {
                          const isCurrentEditing = editingId === design.id;
                          const isFirst = index === 0;
                          const isLast = index === safeDesigns.length - 1;

                          return (
                            <div
                              key={design.id}
                              className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all gap-2 ${
                                isCurrentEditing
                                  ? 'bg-gold/15 border-gold shadow-xs'
                                  : 'bg-beige border-sand'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden flex-1 min-w-0">
                                {/* Order Rank Badge */}
                                <div
                                  className="w-6 h-6 rounded-lg bg-sand/80 border border-sand text-brown font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 font-latin"
                                  title={`ترتيب الظهور: رقم ${index + 1}`}
                                >
                                  #{index + 1}
                                </div>

                                {/* Up / Down Order Buttons */}
                                <div className="flex flex-col gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    disabled={isFirst}
                                    onClick={() => handleMoveUp(index)}
                                    className={`w-5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                                      isFirst
                                        ? 'opacity-20 cursor-not-allowed bg-cream/40 text-brown-muted'
                                        : 'bg-cream border border-sand text-brown hover:bg-gold-dark hover:text-white hover:border-gold-dark active:scale-95'
                                    }`}
                                    title="تقديم الكرت للأعلى (يظهر قبل)"
                                    aria-label="تقديم للأعلى"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLast}
                                    onClick={() => handleMoveDown(index)}
                                    className={`w-5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                                      isLast
                                        ? 'opacity-20 cursor-not-allowed bg-cream/40 text-brown-muted'
                                        : 'bg-cream border border-sand text-brown hover:bg-gold-dark hover:text-white hover:border-gold-dark active:scale-95'
                                    }`}
                                    title="تأخير الكرت للأسفل (يظهر بعد)"
                                    aria-label="تأخير للأسفل"
                                  >
                                    ▼
                                  </button>
                                </div>

                                {design.image ? (
                                  <img
                                    src={design.image}
                                    alt={design.name}
                                    className="w-8 h-11 object-cover rounded-md border border-sand/60 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-11 bg-cream rounded-md border border-sand/60 flex items-center justify-center text-xs shrink-0">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4 text-gold-dark/70"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.75"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                      <circle cx="9" cy="9" r="2" />
                                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                    </svg>
                                  </div>
                                )}
                                <div className="overflow-hidden min-w-0">
                                  <p className="font-arabic font-bold text-xs text-brown truncate">
                                    {design.name || 'تصميم بدون اسم'}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-brown-muted font-arabic">
                                    {design.tag && (
                                      <span className="text-gold-dark font-medium">{design.tag}</span>
                                    )}
                                    <span className="truncate max-w-[85px] sm:max-w-[120px] font-latin opacity-70">
                                      {(design.url || '').replace(/^https?:\/\//, '')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons: Edit and Delete Side by Side */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(design)}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-arabic font-medium transition-colors ${
                                    isCurrentEditing
                                      ? 'bg-gold-dark text-white border border-gold-dark'
                                      : 'bg-cream border border-sand text-brown hover:border-gold hover:text-gold-dark'
                                  }`}
                                  title="تعديل بيانات هذا الكرت"
                                >
                                  <span className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-3 h-3"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                      <path d="m15 5 4 4" />
                                    </svg>
                                    <span>تعديل</span>
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDesign(design.id)}
                                  className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-[11px] font-arabic"
                                  title="حذف هذا الكرت"
                                >
                                  <span className="flex items-center gap-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-3 h-3 text-red-700"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                    <span>حذف</span>
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Logout Button */}
              <div className="pt-2 border-t border-sand flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-arabic text-brown-muted hover:text-red-700 flex items-center gap-1"
                >
                  <span>تسجيل خروج</span>
                </button>
                <span className="text-[10px] text-brown-muted font-latin">v1.2 • WASM Cloud</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
