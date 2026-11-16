// Upload island: /new/. Creates a community repo and uploads files to it from the browser, the same way
// huggingface_hub and the fw CLI do (spec/parts/write-api.yaml, flow in spec/accounts-v1.md 11.3):
//   1. POST /api/repos/create                         (409 = the repo is already yours: carry on)
//   2. sha256 of every file, in 4 MiB slices          (vendor/sha256-stream.js, main thread)
//   3. POST /api/{type}/{ns}/{name}/preupload/main    (limits answer here, before any byte moves)
//   4. POST /{ns}/{name}.git/info/lfs/objects/batch   (presigned PUT, or multipart parts, from R2)
//   5. PUT bytes to R2 (basic up to 64 MiB, else 32 MiB parts), each with retries, then complete + verify
//   6. POST /api/{type}/{ns}/{name}/commit/main       (NDJSON) -> the repo is `scanning`
// Every file is scanned before anyone can download it; the island then follows the repo until it reads live or held.
// No number is written here: caps come from GET /api/fw/v1/limits and from the API's own answers.
import { sha256File } from '/assets/vendor/sha256-stream.js';

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v);
  for (const k of kids) if (k != null) e.append(k);
  return e;
};

// ---- plain-language errors -------------------------------------------------------------------------------------
const WORDS = {
  site_full: 'Freeweights has reached its community storage limit for now, so no new uploads fit. Nothing you uploaded was kept. Try again later.',
  storage_full: 'This upload would take your account over its storage limit. Delete a repo you no longer need, or upload fewer or smaller files.',
  file_too_large: 'A file is larger than the current single-file limit. Split it, or leave it out.',
  file_type_not_allowed: 'Programs and archives (such as .exe, .sh, .zip and .tar) are not accepted. Upload the model files themselves.',
  uploads_paused: 'Uploads are switched off right now. Browsing and downloading still work. Check back soon.',
  rules_not_accepted: 'You need to accept the upload rules before you upload. You can do that on your account page.',
  account_suspended: 'This account is suspended and cannot upload.',
  repo_limit: 'You already have the most repos an account can hold. Delete one, then create this one.',
  rate_limited: 'You are going a little fast. Wait a while and try again.',
  perk_required: 'Private repos are not offered yet. Repos here are public.',
  too_many_files: 'That is more files than one upload can take. Upload them in smaller groups.',
  size_mismatch: 'A file did not arrive complete, so it was discarded. Start the upload again.',
  profile_not_found: 'Choose your Freeweights handle on your account page first.',
  handle_required: 'Choose your Freeweights handle on your account page first.',
  not_implemented: 'That part is not built yet.',
  unauthorized: 'Your session has ended. Sign in again to continue.',
  forbidden: 'This account cannot upload to that namespace.',
  accounts_not_configured: 'Accounts are not switched on yet. Nothing is wrong with your files.',
};
const KNOWN = Object.keys(WORDS);
export const explain = (code, fallback) => WORDS[code] || fallback || 'The upload stopped. Nothing is wrong with your files. Try again in a moment.';

class UploadError extends Error {
  constructor(code, message, extra = {}) { super(message); this.code = code; Object.assign(this, extra); }
}
// Reads an API error reply into an UploadError with words a person can act on.
async function apiError(res, what) {
  let j = null; try { j = await res.json(); } catch { /* not JSON */ }
  let code = j && typeof j.error === 'string' ? j.error : '';
  // A per-object LFS error carries the code inside its message (spec 11.2).
  if (!code && j && j.message) code = KNOWN.find((k) => String(j.message).includes(k)) || '';
  if (res.status === 401) code = 'unauthorized';
  const paths = j && Array.isArray(j.paths) ? j.paths : [];
  const base = explain(code, null);
  const extra = paths.length ? ` Affected: ${paths.slice(0, 5).join(', ')}${paths.length > 5 ? ` and ${paths.length - 5} more` : ''}.` : '';
  const msg = code ? base + extra : (j && j.message ? String(j.message) : `${what} did not go through (HTTP ${res.status}).`);
  return new UploadError(code || 'http_' + res.status, msg, { status: res.status, retryAfter: Number(res.headers.get('retry-after')) || 0 });
}

// ---- byte helpers ----------------------------------------------------------------------------------------------
export const fmtBytes = (n) => {
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; let v = Number(n) || 0;
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return (v >= 100 || i === 0 ? Math.round(v) : v.toFixed(v >= 10 ? 1 : 2)) + ' ' + u[i];
};
function b64(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_REGULAR = 10 * 1024 * 1024; // preupload says `regular` only for small text; this guards memory if it ever says more

/** The path a picked file will have in the repo: a folder pick drops the folder's own name. */
export function repoPath(file) {
  const rel = file.webkitRelativePath || file.name;
  return rel.includes('/') && file.webkitRelativePath ? rel.slice(rel.indexOf('/') + 1) : rel;
}
const typeSeg = (type) => (type === 'dataset' ? 'datasets' : 'models');
const lfsPath = (type, ns, name) => `${type === 'dataset' ? '/datasets' : ''}/${ns}/${name}.git/info/lfs/objects/batch`;

// ---- PUT with progress and retry (fetch has no upload progress) -------------------------------------------------
function putOnce(url, blob, headers, onBytes, signal) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    for (const [k, v] of Object.entries(headers || {})) if (!/^(content-length|host)$/i.test(k)) x.setRequestHeader(k, v);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onBytes(e.loaded); };
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve(x.getResponseHeader('etag') || '') : reject(new UploadError('put_' + x.status, `The storage server answered ${x.status}.`, { status: x.status })));
    x.onerror = () => reject(new UploadError('network', 'The connection dropped.'));
    x.onabort = () => reject(new UploadError('aborted', 'Stopped.'));
    if (signal) signal.addEventListener('abort', () => x.abort(), { once: true });
    x.send(blob);
  });
}
export async function putRetry(url, blob, headers, onBytes, signal, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    if (signal && signal.aborted) throw new UploadError('aborted', 'Stopped.');
    try { onBytes(0); return await putOnce(url, blob, headers, onBytes, signal); } catch (e) {
      last = e;
      // 4xx other than a timeout will not get better by retrying (an expired or refused link).
      if (e.status && e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) break;
      if (e.code === 'aborted') break;
      await sleep(1000 * 3 ** i);
    }
  }
  if (last && last.status === 403) throw new UploadError('link_expired', 'The upload link ran out before the file finished. Start the upload again.');
  throw last;
}

// ---- the island --------------------------------------------------------------------------------------------------
export default async function mount(el, props, api) {
  const root = el.querySelector('[data-slot=app]') || el;
  const say = (...kids) => root.replaceChildren(...kids);
  const panel = (...kids) => h('div', { class: 'fwu-panel' }, ...kids);
  const note = (text, cls = '') => h('div', { class: 'fwu-note ' + cls, role: cls === 'err' ? 'alert' : 'status' }, text);

  if (!api.signedIn()) {
    return say(panel(h('b', {}, 'Sign in to upload'), h('span', {}, 'Use your Allternit account. Downloading never needs one.'),
      h('a', { class: 'btn solid', href: api.signInUrl(), 'data-act': 'sign-in' }, 'Sign in')));
  }
  say(note('Checking your account…'));

  let who, limits = null;
  try {
    const [wr, lr] = await Promise.all([api.fetch('/api/whoami-v2'), fetch('/api/fw/v1/limits').catch(() => null)]);
    if (lr && lr.ok) limits = await lr.json().catch(() => null);
    if (wr.status === 401) return say(panel(h('b', {}, 'Your session has ended'), h('a', { class: 'btn solid', href: api.signInUrl() }, 'Sign in again')));
    if (wr.status === 404) return say(panel(h('b', {}, 'Choose your handle first'), h('span', {}, WORDS.profile_not_found), h('a', { class: 'btn solid', href: '/account/' }, 'Open your account')));
    if (wr.status === 503) return say(note(WORDS.accounts_not_configured, 'err'));
    if (!wr.ok) throw new Error('whoami');
    who = await wr.json();
  } catch { return say(note('Freeweights could not read your account just now. Reload to try again.', 'err')); }
  const ns = who.name;

  const paused = limits && limits.open === false;
  const delayed = limits && limits.scanning_delayed;
  const lim = (limits && limits.limits) || {};
  const form = h('form', { class: 'fwu-form', novalidate: true });
  const typeSel = h('select', { id: 'fwu-type', name: 'type' }, h('option', { value: 'model' }, 'Model'), h('option', { value: 'dataset' }, 'Dataset'));
  const nameIn = h('input', { id: 'fwu-name', name: 'name', required: true, maxlength: '96', pattern: '[A-Za-z0-9._\\-]{1,96}', placeholder: 'my-model', autocomplete: 'off', spellcheck: 'false' });
  const pick = h('input', { id: 'fwu-files', type: 'file', multiple: true, class: 'fwu-hidden' });
  const pickDir = h('input', { id: 'fwu-dir', type: 'file', webkitdirectory: true, class: 'fwu-hidden' });
  const list = h('ul', { class: 'fwu-files', 'aria-label': 'Files to upload' });
  const sum = h('p', { class: 'fwu-sum small' }, 'No files chosen yet.');
  const go = h('button', { class: 'btn solid', type: 'submit', disabled: true }, 'Create repo and upload');
  const msg = h('div', { class: 'fwu-msgs', 'aria-live': 'polite' });
  let files = []; // [{ file, path }]

  const redraw = () => {
    list.replaceChildren(...files.slice(0, 200).map((f) => h('li', {}, h('span', { class: 'mono path' }, f.path), h('span', { class: 'mono sub' }, fmtBytes(f.file.size)))));
    const total = files.reduce((a, f) => a + f.file.size, 0);
    sum.textContent = files.length ? `${files.length} file${files.length === 1 ? '' : 's'}, ${fmtBytes(total)}${files.length > 200 ? ' (first 200 listed)' : ''}` : 'No files chosen yet.';
    const big = lim.file_max_bytes != null ? files.filter((f) => f.file.size > lim.file_max_bytes) : [];
    msg.replaceChildren(...(big.length ? [note(`${big.length === 1 ? big[0].path + ' is' : big.length + ' files are'} over the current single-file limit of ${fmtBytes(lim.file_max_bytes)}.`, 'err')] : []));
    go.disabled = !files.length || !nameIn.value.trim() || !!big.length || !!paused;
  };
  const take = (list_) => { files = Array.from(list_).filter((f) => !/(^|\/)\.DS_Store$/.test(f.webkitRelativePath || f.name)).map((file) => ({ file, path: repoPath(file) })); redraw(); };
  pick.addEventListener('change', () => take(pick.files));
  pickDir.addEventListener('change', () => take(pickDir.files));
  nameIn.addEventListener('input', redraw);

  const dropZone = h('div', { class: 'fwu-drop' },
    h('b', {}, 'Drop files here'),
    h('span', {}, 'or'),
    h('span', { class: 'fwu-btns' },
      h('label', { class: 'btn', for: 'fwu-files', tabindex: '0' }, 'Choose files'),
      h('label', { class: 'btn', for: 'fwu-dir', tabindex: '0' }, 'Choose a folder')));
  for (const ev of ['dragenter', 'dragover']) dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('is-over'); });
  for (const ev of ['dragleave', 'drop']) dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.remove('is-over'); });
  dropZone.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files.length) take(e.dataTransfer.files); });
  for (const lab of dropZone.querySelectorAll('label')) lab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById(lab.getAttribute('for')).click(); } });

  const limitLine = limits && limits.limits ? h('p', { class: 'fwu-sum small' },
    [lim.file_max_bytes != null ? `Largest file: ${fmtBytes(lim.file_max_bytes)}.` : '', lim.files_per_commit != null ? `Up to ${lim.files_per_commit} files per upload.` : '', lim.user_cap_bytes != null ? `Your storage: ${fmtBytes(lim.user_cap_bytes)}.` : ''].filter(Boolean).join(' ') + ' These limits can change.') : null;

  form.append(
    h('div', { class: 'fwu-row' }, h('label', { for: 'fwu-type' }, 'Kind'), typeSel),
    h('div', { class: 'fwu-row' }, h('label', { for: 'fwu-name' }, 'Repo name'), h('div', { class: 'fwu-name' }, h('span', { class: 'mono sub' }, ns + ' /'), nameIn)),
    dropZone, pick, pickDir, list, sum, ...(limitLine ? [limitLine] : []),
    h('p', { class: 'small sub' }, 'Repos are public. Every file is scanned before anyone can download it, and a file that fails the scan is held for review. By uploading you confirm the files are yours to share and you have read the ', h('a', { class: 'link', href: '/docs/uploads/' }, 'upload rules'), '.'),
    msg, go);
  say(
    ...(paused ? [note(WORDS.uploads_paused, 'err')] : []),
    ...(delayed ? [note('Scanning is delayed right now. Uploads still work, and files stay in "scanning" until the scanner catches up.')] : []),
    form);
  redraw();

  const ac = new AbortController();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameIn.value.trim();
    if (!/^[A-Za-z0-9._-]{1,96}$/.test(name) || name.includes('..') || name.includes('--') || name.endsWith('.git')) {
      return msg.replaceChildren(note('A repo name uses letters, numbers, dot, dash and underscore, up to 96 characters, with no "..", "--" or ".git" ending.', 'err'));
    }
    await run({ type: typeSel.value, name, files });
  });

  // ---- the upload itself ----
  async function run({ type, name, files: items }) {
    const total = items.reduce((a, f) => a + f.file.size, 0);
    const bar = h('progress', { max: '100', value: '0', 'aria-label': 'Upload progress' });
    const status = h('p', { class: 'fwu-status', 'aria-live': 'polite' }, 'Starting…');
    const rows = new Map(items.map((f) => [f.path, h('li', {}, h('span', { class: 'mono path' }, f.path), h('span', { class: 'mono sub' }, 'waiting'))]));
    const cancel = h('button', { class: 'btn', type: 'button' }, 'Stop');
    cancel.addEventListener('click', () => ac.abort());
    say(panel(h('b', {}, `Uploading to ${ns}/${name}`), bar, status, h('ul', { class: 'fwu-files' }, ...rows.values()), cancel));
    const rowText = (p, t) => { const r = rows.get(p); if (r) r.lastChild.textContent = t; };
    let doneBytes = 0; // bytes fully uploaded; the one in flight is added by `inflight`
    let inflight = 0;
    const paint = () => { bar.value = total ? Math.min(100, ((doneBytes + inflight) / total) * 100) : 0; };

    try {
      // 1. create
      status.textContent = 'Creating the repo…';
      const cr = await api.fetch('/api/repos/create', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, type, organization: null }) });
      if (!cr.ok && cr.status !== 409) throw await apiError(cr, 'Creating the repo');

      // 2. hash
      const entries = [];
      let hashed = 0;
      for (const it of items) {
        status.textContent = `Reading ${it.path}…`;
        rowText(it.path, 'checking');
        const sha = await sha256File(it.file, { signal: ac.signal, onProgress: (d) => { bar.value = total ? ((hashed + d) / total) * 100 : 0; } });
        hashed += it.file.size;
        const sample = new Uint8Array(await it.file.slice(0, 512).arrayBuffer());
        entries.push({ ...it, size: it.file.size, sha, sample: b64(sample) });
      }
      bar.value = 0;

      // 3. preupload
      status.textContent = 'Checking the files against the limits…';
      const pr = await api.fetch(`/api/${typeSeg(type)}/${ns}/${name}/preupload/main`, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ files: entries.map((x) => ({ path: x.path, sample: x.sample, size: x.size })) }) });
      if (!pr.ok) throw await apiError(pr, 'The limits check');
      const modes = new Map(((await pr.json()).files || []).map((f) => [f.path, f]));
      const lfs = entries.filter((x) => { const m = modes.get(x.path); return !m || (m.uploadMode !== 'regular' || x.size > MAX_REGULAR) && !m.shouldIgnore; });
      const regular = entries.filter((x) => !lfs.includes(x) && !(modes.get(x.path) || {}).shouldIgnore);

      // 4. LFS batch
      const byOid = new Map();
      if (lfs.length) {
        status.textContent = 'Asking for upload links…';
        const br = await api.fetch(lfsPath(type, ns, name), { method: 'POST', headers: { 'content-type': 'application/vnd.git-lfs+json', accept: 'application/vnd.git-lfs+json' },
          body: JSON.stringify({ operation: 'upload', transfers: ['basic', 'multipart'], hash_algo: 'sha256', objects: lfs.map((x) => ({ oid: x.sha, size: x.size })) }) });
        if (!br.ok) throw await apiError(br, 'The upload request');
        for (const o of (await br.json()).objects || []) byOid.set(o.oid, o);
      }

      // 5. upload
      let n = 0;
      for (const x of lfs) {
        n++;
        const o = byOid.get(x.sha);
        if (o && o.error) { const code = KNOWN.find((k) => String(o.error.message || '').includes(k)) || (o.error.code === 413 ? 'file_too_large' : o.error.code === 507 ? 'storage_full' : ''); throw new UploadError(code, explain(code, o.error.message), { path: x.path }); }
        const up = o && o.actions && o.actions.upload;
        if (!up) { rowText(x.path, 'already stored'); doneBytes += x.size; paint(); continue; } // this repo already holds the bytes
        status.textContent = `Uploading ${x.path} (${n} of ${lfs.length})…`;
        const same = (href) => new URL(href, location.href).origin === location.origin;
        const hdr = up.header || {};
        if (hdr.chunk_size) {
          const chunk = Number(hdr.chunk_size);
          const parts = [];
          const count = Math.ceil(x.size / chunk) || 1;
          for (let i = 0; i < count; i++) {
            const key = String(i + 1).padStart(5, '0');
            const url = hdr[key];
            if (!url) throw new UploadError('bad_plan', 'The server sent an incomplete upload plan. Start again.');
            const slice = x.file.slice(i * chunk, Math.min((i + 1) * chunk, x.size));
            const etag = await putRetry(url, slice, {}, (b) => { inflight = i * chunk + b; rowText(x.path, `${Math.round(((i * chunk + b) / x.size) * 100)}%`); paint(); }, ac.signal);
            if (!etag) throw new UploadError('no_etag', 'The storage server did not return a part tag. Start the upload again.');
            parts.push({ partNumber: i + 1, etag });
          }
          if (!same(up.href)) throw new UploadError('bad_plan', 'The upload plan pointed somewhere unexpected. Start again.');
          const cm = await api.fetch(up.href, { method: 'POST', headers: { 'content-type': 'application/vnd.git-lfs+json' }, body: JSON.stringify({ oid: x.sha, parts }) });
          if (!cm.ok) throw await apiError(cm, 'Finishing the upload');
        } else {
          await putRetry(up.href, x.file, hdr, (b) => { inflight = b; rowText(x.path, `${Math.round((b / (x.size || 1)) * 100)}%`); paint(); }, ac.signal);
        }
        inflight = 0; doneBytes += x.size; paint();
        const ver = o.actions.verify;
        if (ver) {
          if (!same(ver.href)) throw new UploadError('bad_plan', 'The upload plan pointed somewhere unexpected. Start again.');
          const vr = await api.fetch(ver.href, { method: 'POST', headers: { 'content-type': 'application/vnd.git-lfs+json', ...(ver.header || {}) }, body: JSON.stringify({ oid: x.sha, size: x.size }) });
          if (!vr.ok) throw await apiError(vr, 'Checking the upload');
        }
        rowText(x.path, 'uploaded');
      }

      // 6. commit
      status.textContent = 'Saving…';
      const lines = [JSON.stringify({ key: 'header', value: { summary: `Upload ${entries.length} file${entries.length === 1 ? '' : 's'} from the Freeweights site` } })];
      for (const x of lfs) lines.push(JSON.stringify({ key: 'lfsFile', value: { path: x.path, algo: 'sha256', oid: x.sha, size: x.size } }));
      for (const x of regular) lines.push(JSON.stringify({ key: 'file', value: { path: x.path, encoding: 'base64', content: b64(new Uint8Array(await x.file.arrayBuffer())) } }));
      const cmr = await api.fetch(`/api/${typeSeg(type)}/${ns}/${name}/commit/main`, { method: 'POST', headers: { 'content-type': 'application/x-ndjson' }, body: lines.join('\n') });
      if (!cmr.ok) throw await apiError(cmr, 'Saving the upload');
      bar.value = 100;
      for (const k of rows.keys()) rowText(k, 'scanning');
      scanning({ type, name, count: entries.length });
    } catch (err) {
      if (err && (err.code === 'aborted' || err.name === 'AbortError')) return say(panel(h('b', {}, 'Stopped'), h('span', {}, 'Nothing was published. Files already sent are discarded within the hour.'), restart()));
      const retry = err && err.retryAfter ? ` Try again in about ${Math.ceil(err.retryAfter / 60)} minute${err.retryAfter > 90 ? 's' : ''}.` : '';
      say(note((err && err.message ? err.message : explain('')) + retry, 'err'), restart());
    }
  }
  const restart = () => { const b = h('button', { class: 'btn', type: 'button' }, 'Back to the form'); b.addEventListener('click', () => mount(el, props, api)); return b; };

  // 7. follow the scan (GET /api/fw/v1/repos lists the caller's repos with scan counts)
  function scanning({ type, name }) {
    const state = h('b', {}, 'Scanning');
    const detail = h('span', {}, 'Your files are uploaded. Each one is scanned before anyone can download it. This page updates by itself.');
    const link = h('a', { class: 'btn', href: `/alt.freeweights.community/${ns}/${name}/` }, 'Open the repo page');
    say(panel(state, detail, h('p', { class: 'small sub' }, 'The repo page appears once the scan finishes. You can close this tab; the scan keeps going, and My repos on your account page shows the state.'), h('a', { class: 'btn', href: '/account/' }, 'My repos')));
    let tries = 0;
    const poll = async () => {
      if (!el.isConnected || ++tries > 120) return;
      try {
        const r = await api.fetch(`/api/fw/v1/repos?kind=${type}`);
        if (r.ok) {
          const me = ((await r.json()).repos || []).find((x) => x.name === `${ns}/${name}`);
          if (me && me.status === 'live') { state.textContent = 'Live'; detail.textContent = 'Every file passed the scan. The repo page is up.'; root.querySelector('.fwu-panel').append(link); return; }
          if (me && me.status === 'held') { state.textContent = 'Held for review'; detail.textContent = `One or more files did not pass the scan${me.scans && me.scans.held_codes && me.scans.held_codes.length ? ` (${me.scans.held_codes.join(', ')})` : ''}. Those files are not downloadable. Fix them and upload again, or write to the takedown mailbox listed in the docs if you think this is a mistake.`; return; }
          if (me && me.scans && me.scans.error) { detail.textContent = 'The scanner hit a problem with a file and will retry. Nothing is wrong with your account.'; }
        }
      } catch { /* try again on the next tick */ }
      setTimeout(poll, 8000);
    };
    setTimeout(poll, 4000);
  }
}
