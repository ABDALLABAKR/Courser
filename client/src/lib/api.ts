import { useEffect, useState } from 'react';

export const API_BASE = ((import.meta.env.VITE_SERVER_URL as string | undefined) ?? '').replace(/\/$/, '');

export interface Category { id: string; name_ckb: string; name_en: string }
let catCache: Category[] | null = null;
export function useCategories() {
  const [cats, setCats] = useState<Category[]>(catCache ?? []);
  useEffect(() => {
    if (catCache) return;
    fetch(`${API_BASE}/api/categories`).then((r) => r.json()).then((c: Category[]) => { catCache = c; setCats(c); }).catch(() => {});
  }, []);
  return cats;
}
