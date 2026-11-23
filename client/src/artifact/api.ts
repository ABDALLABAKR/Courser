/** Artifact stand-in for lib/api.ts: categories come from the bundled demo data, no HTTP. */
import { DEMO_CATEGORIES } from '../../../server/src/data/demo-words';

export const API_BASE = '';
export interface Category { id: string; name_ckb: string; name_en: string }
const cats: Category[] = DEMO_CATEGORIES.map((c) => ({ id: c.id, name_ckb: c.ckb, name_en: c.en }));
export function useCategories() { return cats; }
