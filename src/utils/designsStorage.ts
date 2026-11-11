import { designs as initialDesigns, Design } from '../data/designs';

const STORAGE_KEY = 'wasm_custom_designs_v1';
const AUTH_KEY = 'wasm_auth_session';

export function getStoredDesigns(): Design[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read designs from localStorage:', error);
  }
  return initialDesigns;
}

export function saveStoredDesigns(designsList: Design[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designsList));
  } catch (error) {
    console.error('Failed to save designs to localStorage:', error);
  }
}

export function resetStoredDesigns(): Design[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset designs in localStorage:', error);
  }
  return initialDesigns;
}

export function checkAuth(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuth(isAuth: boolean): void {
  if (isAuth) {
    sessionStorage.setItem(AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

// Compress/resize uploaded image to avoid exceeding localStorage quota
export async function compressImage(file: File, maxWidth = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // 0.85 quality JPEG base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
