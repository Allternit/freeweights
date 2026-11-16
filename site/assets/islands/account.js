// Account island: /account/ (signed-in card, signed-out panel) and the current-plan mark on /plans/.
// Reads GET /api/whoami-v2 with the Clerk session token. Every state is plain words; none is an error page.
//   no session            -> Sign in button (a plain link to ai.allternit.com/sign-in, works without JavaScript)
//   503 accounts_not_configured -> "Accounts open soon" (the Worker has no Clerk key yet)
//   200                   -> MemberCard, then upload status, usage meter and My repos (limits, account, repos)
//   404 profile_not_found -> handle step: pick a handle, accept the upload rules (POST /api/fw/v1/account)
//   401 / other           -> signed-out panel (a stale session) or a short retry note
const TIER = { free: 'free', plus: 'plus', super: 'max', max: 'max', ultra: 'ultra' };
const LABEL = { free: 'Free', plus: 'Plus', max: 'Max', ultra: 'Ultra' };
export const tierOf = (id) => TIER[id] || 'free';

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  for (const k of kids) e.append(k);
  return e;
};

export function memberCard(plan, member) {
  const tier = tierOf(plan);
  const card = h('div', { class: 'fwp fwp-card' + (member ? '' : ' is-empty'), 'data-tier': tier, role: 'img', 'aria-label': `${LABEL[tier]} plan card${member ? ` for ${member}` : ''}` });
  const wm = h('img', { src: `/assets/plans/wordmark-${tier === 'plus' ? 'light' : 'ink'}.svg`, alt: 'A://TERNIT', width: '510', height: '50' });
  card.append(h('div', { class: 'fwp-card-top' }, wm, h('span', { class: 'fwp-stamp' }, LABEL[tier].toUpperCase())));
  card.append(h('div', { class: 'fwp-card-bot' }, h('small', {}, 'MEMBER'), h('b', {}, member || 'Not signed in')));
  return card;
}

const panel = (...kids) => h('div', { class: 'fwa-panel' }, ...kids);
const note = (text) => h('div', { class: 'fwa-note' }, text);
const KEY_PRESET = 'https://platform.allternit.com/api-keys?create=freeweights';
const RULES_URL = '/docs/';

// Byte sizes are read from the server and shown as given; no size is written in this file.
export function fmtBytes(n) {
  if (!Number.isFinite(n) || n < 0) return '';
  const u = 'B KB MB GB TB'.split(' ');
  let i = 0, v = n;
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return `${i === 0 || v >= 100 ? Math.round(v) : v.toFixed(1)} ${u[i]}`;
}

// What a repo's scan counts say, in plain words.
export function scanLine(r) {
  const s = r.scans || {};
  const total = (s.queued || 0) + (s.scanning || 0) + (s.clean || 0) + (s.held || 0) + (s.error || 0);
  if (r.status === 'removed') return `Removed${r.removed_reason ? ` (${r.removed_reason})` : ''}`;
  if (r.status === 'held') return `Held: ${(s.held_codes && s.held_codes.length ? s.held_codes.join(', ') : 'a file did not pass the scan')}. Nothing is downloadable.`;
  if (r.status === 'scanning') return `Scanning: ${s.clean || 0} of ${total} files checked`;
  if (r.status === 'draft') return total ? `Draft: ${s.clean || 0} of ${total} files checked` : 'Draft: no files committed yet';
  if (s.error) return `Live. ${s.error} ${s.error === 1 ? 'file' : 'files'} could not be scanned and will be retried.`;
  return 'Live: every file passed the scan';
}

const getJson = async (res) => { try { return await res.json(); } catch { return null; } };

function handleForm(api, name, done) {
  const input = h('input', { type: 'text', id: 'fwa-handle', name: 'handle', autocomplete: 'username', spellcheck: 'false', required: '', pattern: '[A-Za-z0-9][A-Za-z0-9._\\-]{1,41}', maxlength: '42', value: (name || '').replace(/[^A-Za-z0-9._-]/g, '') });
  const rules = h('input', { type: 'checkbox', id: 'fwa-rules', name: 'rules', required: '' });
  const err = h('div', { class: 'fwa-err', role: 'alert', hidden: '' });
  const go = h('button', { class: 'btn solid', type: 'submit' }, 'Create my Freeweights handle');
  const form = h('form', { class: 'fwa-form', novalidate: '' },
    h('label', { for: 'fwa-handle' }, 'Handle'),
    input,
    h('small', {}, 'Letters, numbers, dot, dash and underscore. 2 to 42 characters. It is the name in your repo paths and cannot be taken by someone else once chosen.'),
    h('label', { class: 'fwa-check', for: 'fwa-rules' }, rules, h('span', {}, 'I accept the ', h('a', { href: RULES_URL }, 'upload rules'), '. Models and datasets I upload are public and scanned before anyone can download them.')),
    err, go);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    if (!input.checkValidity()) { err.textContent = 'That handle is not valid. Use 2 to 42 letters, numbers, dots, dashes or underscores, starting with a letter or number.'; err.hidden = false; input.focus(); return; }
    if (!rules.checked) { err.textContent = 'Accept the upload rules to continue.'; err.hidden = false; rules.focus(); return; }
    go.disabled = true;
    try {
      const res = await api.fetch('/api/fw/v1/account', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle: input.value, acceptRules: true }) });
      const j = await getJson(res);
      if (res.ok) return done();
      err.textContent = (j && j.error === 'handle_taken') ? 'That handle is taken or reserved. Try another.' : (res.status === 401 ? 'Your session has ended. Sign in again.' : 'Freeweights could not save that just now. Try again in a minute.');
    } catch { err.textContent = 'Could not reach Freeweights just now. Try again in a minute.'; }
    err.hidden = false; go.disabled = false;
  });
  return form;
}

function meter(used, cap) {
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const bar = h('div', { class: 'fwa-meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': 'Storage used' }, h('i', {}));
  bar.firstChild.style.width = pct + '%';
  if (pct >= 90) bar.classList.add('is-high');
  return h('div', { class: 'fwa-usage' }, h('div', { class: 'fwa-usage-row' }, h('b', {}, 'Storage'), h('span', { class: 'mono' }, cap > 0 ? `${fmtBytes(used)} of ${fmtBytes(cap)}` : fmtBytes(used))), bar);
}

function repoList(repos) {
  if (!repos.length) return h('p', { class: 'fwa-empty' }, 'No repos yet. Create one with the fw CLI or with huggingface_hub pointed at Freeweights; it shows up here with its scan state.');
  const ul = h('ul', { class: 'fwa-repos' });
  for (const r of repos) {
    // Community repo pages live at /alt.freeweights.community/<ns>/<name>/ (worker/src/pages/repo.ts). The page
    // exists once a commit has been served; until then (and after a removal) the name is plain text.
    const title = r.page_url ? h('a', { class: 'mono', href: r.page_url }, r.name) : h('span', { class: 'mono' }, r.name);
    ul.append(h('li', { 'data-status': r.status },
      h('div', { class: 'fwa-repo-top' }, title, h('span', { class: 'fwa-state' }, r.type === 'dataset' ? `dataset · ${r.status}` : r.status), h('span', { class: 'mono sub' }, fmtBytes(r.bytes || 0))),
      h('div', { class: 'fwa-scan' }, scanLine(r))));
  }
  return ul;
}

async function loadHandleView(api, j, side, body, show) {
  const plan = (j.allternit && j.allternit.plan) || 'free';
  const card = memberCard(plan, j.name || '');
  const head = panel(h('b', {}, `${j.fullname || j.name}`), h('span', {}, `${LABEL[tierOf(plan)]} plan`),
    h('a', { class: 'btn', href: '/plans/' }, 'See plans'), h('button', { class: 'btn', type: 'button', 'data-act': 'sign-out' }, 'Sign out'));
  show(card, head);
  head.querySelector('[data-act=sign-out]').addEventListener('click', () => api.signOut());

  const [lim, acc, repos] = await Promise.all([
    api.fetch('/api/fw/v1/limits').then(async (r) => (r.ok ? getJson(r) : null)).catch(() => null),
    api.fetch('/api/fw/v1/account').then(async (r) => (r.ok ? getJson(r) : null)).catch(() => null),
    api.fetch('/api/fw/v1/repos').then(async (r) => (r.ok ? getJson(r) : null)).catch(() => null),
  ]);
  const uploads = h('section', { class: 'fwa-panel', 'aria-label': 'Uploads' }, h('b', {}, 'Uploads'));
  body.append(uploads);

  if (!lim) uploads.append(note('Upload status could not be read just now. Reload to try again.'));
  else if (!lim.open) uploads.append(note('Uploads are paused right now. Downloads are not affected. This page shows your repos and usage as usual, and uploads resume when they are switched back on.'));
  else if (lim.site && lim.site.full) uploads.append(note('Community storage is full right now, so new uploads are paused until space frees up. Downloads are not affected.'));
  if (lim && lim.scanning_delayed) uploads.append(note('Scanning is running behind. New uploads stay in quarantine a little longer than usual.'));

  if (acc && !acc.rules_accepted_at) {
    const rules = h('input', { type: 'checkbox', id: 'fwa-rules2' });
    const btn = h('button', { class: 'btn solid', type: 'button' }, 'Accept and continue');
    const err = h('div', { class: 'fwa-err', role: 'alert', hidden: '' });
    btn.addEventListener('click', async () => {
      if (!rules.checked) { err.textContent = 'Tick the box to accept the upload rules.'; err.hidden = false; return; }
      btn.disabled = true;
      try {
        const res = await api.fetch('/api/fw/v1/account', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ acceptRules: true }) });
        if (res.ok) { body.replaceChildren(); return loadHandleView(api, j, side, body, show); }
      } catch { /* falls through */ }
      err.textContent = 'Could not save that just now. Try again in a minute.'; err.hidden = false; btn.disabled = false;
    });
    uploads.append(h('span', {}, 'Uploads need the upload rules accepted once.'),
      h('label', { class: 'fwa-check', for: 'fwa-rules2' }, rules, h('span', {}, 'I accept the ', h('a', { href: RULES_URL }, 'upload rules'), '.')), err, btn);
  }

  if (acc && acc.usage) {
    const u = acc.usage;
    const used = (u.public_bytes || 0) + (u.private_bytes || 0) + (u.quarantine_bytes || 0);
    uploads.append(meter(used, acc.storage_cap_bytes || 0));
    if (acc.storage_cap_bytes == null) uploads.append(h('small', { class: 'sub' }, 'No storage limit is set at the moment.'));
  }
  uploads.append(h('a', { class: 'btn', href: KEY_PRESET, rel: 'noopener' }, 'Create an upload key'),
    h('small', { class: 'sub' }, 'Opens Allternit Console with the Freeweights scopes selected. Use the key with the fw CLI or huggingface_hub.'));

  const mine = h('section', { class: 'fwa-panel', 'aria-label': 'My repos' }, h('b', {}, 'My repos'));
  mine.append(repos && Array.isArray(repos.repos) ? repoList(repos.repos) : note('Your repos could not be read just now. Reload to try again.'));
  body.append(mine);
}

export default async function mount(el, props, api) {
  const page = props.page || 'account';
  if (page === 'plans') return markCurrent(el, api);

  const side = el.querySelector('[data-slot=card]');
  const body = el.querySelector('[data-slot=body]');
  const show = (card, ...kids) => { side.replaceChildren(card); body.replaceChildren(...kids); };
  const signedOut = (extra) => show(memberCard('free', ''), panel(h('b', {}, 'Sign in with your Allternit account'),
    h('span', {}, 'One account for Allternit and Freeweights. Downloads stay free and need no account.'),
    h('a', { class: 'btn solid', href: api.signInUrl(), 'data-act': 'sign-in' }, 'Sign in')), ...(extra ? [note(extra)] : []));

  if (!api.signedIn()) return signedOut();
  show(memberCard('free', ''), panel(h('span', {}, 'Checking your session…')));
  let res;
  try { res = await api.fetch('/api/whoami-v2'); } catch { return show(memberCard('free', ''), note('Could not reach Freeweights just now. Reload to try again.')); }
  const j = await getJson(res);
  const code = j && j.error;
  if (res.status === 503 && code === 'accounts_not_configured') {
    return show(memberCard('free', ''), panel(h('b', {}, 'Accounts open soon'),
      h('span', {}, 'Signing in to Freeweights is not switched on yet. Nothing is wrong with your account. Everything public still works with no account.'),
      h('a', { class: 'btn', href: '/alt.freeweights/' }, 'Browse the catalog')));
  }
  if (res.status === 401) return signedOut('Your session has ended. Sign in again to continue.');
  if (res.status === 404 && code === 'profile_not_found') {
    let name = ''; try { const c = await api.clerk(); name = (c.user && (c.user.username || c.user.firstName || '')) || ''; } catch { /* name stays empty */ }
    const remount = () => mount(el, props, api);
    const out = h('button', { class: 'btn', type: 'button', 'data-act': 'sign-out' }, 'Sign out');
    out.addEventListener('click', () => api.signOut());
    return show(memberCard('free', name), panel(h('b', {}, 'Choose your Freeweights handle'),
      h('span', {}, 'You are signed in. Pick a handle to upload models and datasets. Downloading never needs one.'),
      handleForm(api, name, remount), out));
  }
  if (!res.ok || !j) return show(memberCard('free', ''), note('Freeweights could not read your account just now. Reload to try again.'));
  return loadHandleView(api, j, side, body, show);
}

async function markCurrent(el, api) {
  if (!api.signedIn()) return;
  try {
    const res = await api.fetch('/api/whoami-v2');
    if (!res.ok) return;
    const j = await res.json();
    const tier = tierOf(j.allternit && j.allternit.plan);
    const t = el.querySelector(`.fwp-ticket[data-tier=${tier}]`);
    if (!t) return;
    t.classList.add('is-current');
    const stub = t.querySelector('.fwp-ticket-stub');
    if (stub) stub.replaceChildren(h('span', { class: 'fwp-stamp' }, 'Your plan'));
  } catch { /* the page reads the same without it */ }
}
