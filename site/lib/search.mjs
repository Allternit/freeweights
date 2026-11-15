import { SECTIONS, dataSource, logoOf } from './catalog.mjs';
import { CARD_SHARD, COLLECTIONS, IDX_SHARD, PAGE, VARIANT_ROWS } from './paging.mjs';
import { ENTRIES, FACETS, FACET_LABEL, cardRow, cards, secCount, shardCard, toolKind } from './cards.mjs';
import { page } from './registry.mjs';
import { write } from './assets.mjs';

export function writeSearchData(write) {
  const TOP_ALL = ENTRIES();
  const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };
  const cardPage = {};
  chunk(TOP_ALL, CARD_SHARD).forEach((rs, i) => { rs.forEach((r) => (cardPage[r.id] = i + 1)); write(`data/catalog/p${i + 1}.json`, JSON.stringify(rs.map(shardCard))); });
  chunk(VARIANT_ROWS, CARD_SHARD).forEach((rs, i) => { rs.forEach((r) => (cardPage[r.id] = i + 1)); write(`data/catalog/v${i + 1}.json`, JSON.stringify(rs.map(shardCard))); });
{
  const fkeys = FACETS.map(([k]) => k); const dict = Object.fromEntries(fkeys.map((k) => [k, []])); const dix = Object.fromEntries(fkeys.map((k) => [k, {}]));
  const code = (k, v) => { const m = dix[k]; if (m[v] === undefined) { m[v] = dict[k].length; dict[k].push(v); } return m[v]; };
  const all = [...TOP_ALL, ...VARIANT_ROWS]; const byFam = {};
  for (const r of all) {
    const c = cardRow(r);
    const fv = fkeys.map((k) => { const a = c.fv[k].map((v) => code(k, v)); return a.length === 1 ? a[0] : a; });
    const e = [r.id, r.name === r.repo ? '' : r.name, fv, r.size || 0, r.params || 0, r.added ? String(r.added).slice(0, 10) : '', r.rk, r.dl || 0, cardPage[r.id], (r.isVar ? 1 : 0) | (r.sample ? 2 : 0), COLLECTIONS.map((x, i) => (r.coll || []).includes(x.slug) ? i : -1).filter((i) => i >= 0)];
    if (r.kind === 'tool') e.push([r.tool && toolKind(r.tool), c.lang, c.sum && c.sum.slice(0, 90)].filter(Boolean).join(' '), c.tag || '');
    else e.push([c.lic, c.sum && c.sum.slice(0, 200)].filter(Boolean).join(' '));
    (byFam[r.fam] = byFam[r.fam] || []).push(e);
  }
  // Pack small sections into shared files (up to IDX_SHARD records) so the whole catalog loads in a few
  // requests; a section bigger than one file gets its own files. A section page loads only files that hold it.
  const shards = []; let cur = { fams: [], es: [] };
  const flush = () => { if (!cur.es.length) return; const f = `s${shards.length + 1}.json`; shards.push({ f, n: cur.es.length, fams: cur.fams }); write(`data/search/${f}`, JSON.stringify(cur.es)); cur = { fams: [], es: [] }; };
  for (const fam of Object.keys(byFam).sort()) {
    const es = byFam[fam];
    if (es.length >= IDX_SHARD) { flush(); chunk(es, IDX_SHARD).forEach((part) => { cur = { fams: [fam], es: part }; flush(); }); continue; }
    if (cur.es.length + es.length > IDX_SHARD) flush();
    cur.fams.push(fam); cur.es.push(...es);
  }
  flush();
  const orgs = [...new Set(all.map((r) => r.org))]; const lg = {}; orgs.forEach((o) => { const l = logoOf(o) || (all.some((r) => r.org === o && r.kind === 'tool') ? '' : ''); if (l) lg[o] = l.replace('/assets/orgs/', ''); });
  write('data/search/index.json', JSON.stringify({ v: 1, page: PAGE, fk: fkeys, dict, shards, coll: COLLECTIONS.map((c) => c.slug), mono: Object.fromEntries(all.map((r) => [r.fam, r.mono])), logos: lg, lc: FACET_LABEL.lc, total: TOP_ALL.length, variants: VARIANT_ROWS.length }));
  write('data/catalog.json', JSON.stringify({ generated_from: dataSource, entries: TOP_ALL.length, variants: VARIANT_ROWS.length, sections: SECTIONS.map((s) => ({ ...s, count: secCount(s) })), collections: COLLECTIONS.map(({ test, rows, ...c }) => ({ ...c, count: rows.length })), shards: { cards: '/data/catalog/p<N>.json (top level) and v<N>.json (variants), ' + CARD_SHARD + ' per file', search: '/data/search/index.json' } }));
}
}
