// Run by tests/test_facet_logic.py. Prints a JSON list of failures (empty = pass).
import { readFileSync } from 'fs';
import vm from 'vm';
// facetlogic.js is a browser script, so run it the way a page does.
const win = {}; vm.runInNewContext(readFileSync(new URL('../site/assets/facetlogic.js', import.meta.url), 'utf8'), { window: win });
const { counts, passes } = win.FWFacet;
const fails = []; const eq = (name, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) fails.push(`${name}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); };
// 6 rows. app and lang are AND facets, lib is an OR facet.
const R = [
  { app: ['ollama', 'vllm'], lang: ['en'], lib: ['gguf'] },
  { app: ['ollama'], lang: ['en', 'fr'], lib: ['gguf'] },
  { app: ['vllm'], lang: ['en'], lib: ['safetensors'] },
  { app: ['vllm', 'sglang'], lang: ['fr'], lib: ['safetensors'] },
  { app: ['ollama', 'vllm'], lang: ['fr'], lib: ['mlx'] },
  { app: [], lang: [], lib: ['gguf'] },
].map((fv) => ({ fv }));
const f = { app: ['ollama'], lang: ['en'] };
const shown = R.filter((r) => passes(r.fv, f)).length;
eq('rows shown with Ollama + English', shown, 2);
// A count is the number of rows you would see after ticking that value too.
for (const k of ['app', 'lang']) {
  const c = counts(R, f, k);
  for (const v of ['ollama', 'vllm', 'sglang', 'en', 'fr']) {
    if (!R.some((r) => (r.fv[k] || []).includes(v))) continue;
    const ticked = { ...f, [k]: [...new Set([...f[k], v])] };
    eq(`${k}=${v} count`, c[v] || 0, R.filter((r) => passes(r.fv, ticked)).length);
  }
  if (Object.values(c).some((n) => n > shown)) fails.push(`${k} has a count above the ${shown} rows shown`);
}
eq('vllm under Ollama + English', counts(R, f, 'app').vllm, 1);
// OR facet: ticking gguf, the safetensors count is what you would get by adding it.
const g = { lib: ['gguf'], app: ['ollama'] };
const cl = counts(R, g, 'lib');
eq('lib counts ignore own ticks', cl, { gguf: 2, mlx: 1 });
if (fails.length) console.log(JSON.stringify(fails)); else console.log('[]');
