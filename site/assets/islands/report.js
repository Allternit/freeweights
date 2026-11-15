// Report island: the "Report this repo" button on community repo pages. Mount point:
//   <div data-fw-island="report" data-repo="rp_..." data-name="ns/name">Fallback text with the takedown mailbox.</div>
// POST /api/fw/v1/reports { target: { type: 'repo', id }, reason_class, body } with the Clerk session token.
// Legal notices without an account go to the takedown mailbox (docs/takedowns); the fallback text names it.
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v);
  for (const k of kids) if (k != null) e.append(k);
  return e;
};
export const REASONS = [
  ['copyright', 'Copyright or licence'],
  ['malware_or_secrets', 'Malware or leaked secrets'],
  ['csam', 'Child sexual abuse material'],
  ['real_person_likeness', 'A real person without permission'],
  ['crime_marketing', 'Sells or promotes crime'],
  ['license_violation', 'Breaks the licence it was taken from'],
  ['spam', 'Spam'],
  ['abuse', 'Harassment or abuse'],
  ['other', 'Something else'],
];
const WORDS = {
  rate_limited: 'You have sent a lot of reports. Wait a while and try again.',
  unauthorized: 'Your session has ended. Sign in again to send a report.',
};

export default function mount(el, props, api) {
  const fallback = el.textContent.trim();
  const open = h('button', { class: 'btn sm', type: 'button' }, 'Report this repo');
  el.replaceChildren(open);
  open.addEventListener('click', () => {
    if (!api.signedIn()) {
      return el.replaceChildren(h('p', { class: 'small' }, 'Sign in to report a repo. ', h('a', { class: 'link', href: api.signInUrl() }, 'Sign in')), h('p', { class: 'small sub' }, fallback));
    }
    const sel = h('select', { id: 'fwc-reason', required: true }, ...REASONS.map(([v, l]) => h('option', { value: v }, l)));
    const body = h('textarea', { id: 'fwc-body', maxlength: '5000', placeholder: 'What should we look at? Link the original if this is copyright.' });
    const send = h('button', { class: 'btn solid', type: 'submit' }, 'Send report');
    const out = h('div', { class: 'small', 'aria-live': 'polite' });
    const form = h('form', { class: 'fwc-report' },
      h('label', { for: 'fwc-reason' }, 'Why?'), sel, h('label', { for: 'fwc-body' }, 'Details (optional)'), body, send, out,
      h('p', { class: 'small sub' }, fallback));
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); send.disabled = true; out.textContent = 'Sending…';
      try {
        const r = await api.fetch('/api/fw/v1/reports', { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ target: { type: 'repo', id: props.repo }, reason_class: sel.value, ...(body.value.trim() ? { body: body.value.trim() } : {}) }) });
        if (r.ok) return el.replaceChildren(h('p', { class: 'small' }, 'Thank you. We received your report and a person will look at it.'));
        let j = null; try { j = await r.json(); } catch { /* not JSON */ }
        out.textContent = r.status === 401 ? WORDS.unauthorized : WORDS[j && j.error] || (j && j.message) || `The report did not go through (HTTP ${r.status}).`;
      } catch { out.textContent = 'Could not reach Freeweights. Check your connection and try again.'; }
      send.disabled = false;
    });
    el.replaceChildren(form);
  });
}
