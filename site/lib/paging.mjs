import { LISTED, ROWS } from './catalog.mjs';
import { isData } from './rows.mjs';

export const PAGE = 100; export const CARD_SHARD = 100; export const IDX_SHARD = 3000;
export const TIER_RANK = { T0: 0, T1: 1, T2: 2 }; export const REL_RANK = { base: 0, finetune: 1, merge: 1, quant: 2, adapter: 2 };
export const normKey = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function rkOf(r) {
  const rel = r.relation && r.relation.type; let t = TIER_RANK[r.tier];
  if (t === undefined) { const o = normKey(r.org), f = normKey(r.fam); t = rel === 'base' && f && o && (o.includes(f) || f.includes(o)) ? 0.5 : rel === 'base' ? 2.5 : 3; }
  return Math.round(t * 10) + (REL_RANK[rel] ?? 1);
}
export const byRank = (a, b) => a.rk - b.rk || (b.dl || 0) - (a.dl || 0) || String(b.added || '').localeCompare(String(a.added || '')) || a.name.localeCompare(b.name);
export const LISTED_IDS = new Set(LISTED.map((r) => r.id));
for (const r of ROWS) { r.rk = rkOf(r); r.isVar = !!(r.relation && (r.relation.type === 'quant' || r.relation.type === 'adapter') && r.relation.parent && LISTED_IDS.has(r.relation.parent) && r.relation.parent !== r.id); }
export const TOP = LISTED.filter((r) => !r.isVar).sort(byRank);
export const VARIANT_ROWS = LISTED.filter((r) => r.isVar).sort(byRank);
export const VARIANTS = {}; for (const v of VARIANT_ROWS) (VARIANTS[v.relation.parent] = VARIANTS[v.relation.parent] || []).push(v);
export const COLLECTIONS = [
  { slug: 'mac-256', name: 'Runs on a 256 GB Mac', blurb: 'Weights of 200 GB or less, counted from each signed manifest (the smallest GGUF or ONNX variant when a repo has several), so the model fits in 256 GB of unified memory with room for context.', test: (r) => !isData(r) && r.weight && r.weight <= 200e9 },
  { slug: 'laptop', name: 'Small enough for a laptop', blurb: 'Weights of 12 GB or less, counted from each signed manifest, so the model loads in 16 GB of memory with room to run.', test: (r) => !isData(r) && r.weight && r.weight <= 12e9 },
  { slug: 'embeddings', name: 'Embeddings and rerankers', blurb: 'Models that turn text or images into vectors, and models that rank search results.', test: (r) => r.section === 'alt.freeweights.embed' || r.tasks.some((t) => ['feature-extraction', 'sentence-similarity', 'text-ranking'].includes(t)) },
  { slug: 'speech', name: 'Speech', blurb: 'Speech recognition, text to speech and audio models.', test: (r) => r.section === 'alt.freeweights.speech' || r.tasks.some((t) => /speech|audio/.test(t)) },
  { slug: 'gguf', name: 'GGUF for llama.cpp and Ollama', blurb: 'Repos with GGUF files, ready for llama.cpp, Ollama and LM Studio.', test: (r) => r.formats.includes('gguf') },
  { slug: 'datasets', name: 'Open datasets', blurb: 'Training and evaluation datasets with a license that allows sharing.', test: isData },
].map((c) => ({ ...c, rows: TOP.filter(c.test) }));
for (const r of ROWS) r.coll = COLLECTIONS.filter((c) => c.test(r)).map((c) => c.slug);
export const bySection = (id) => TOP.filter((r) => r.section === id);
