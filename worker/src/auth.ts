// ---- Auth -------------------------------------------------------------------------------------
// hf_ tokens are refused; alt_ is reserved. The token value is never logged, stored or echoed.
export function tokenKind(req: Request, url: URL): 'hf' | 'alt' | null {
  const vals: string[] = [];
  const a = req.headers.get('authorization');
  if (a) vals.push(a.replace(/^\s*bearer\s+/i, '').trim());
  const x = req.headers.get('x-hf-token'); if (x) vals.push(x.trim());
  for (const [k, v] of url.searchParams) { if (/token/i.test(k) || /^(hf|alt)_/.test(v)) vals.push(v); }
  if (vals.some((v) => v.startsWith('hf_'))) return 'hf';
  if (vals.some((v) => v.startsWith('alt_'))) return 'alt';
  return null;
}
