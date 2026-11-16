// Plans island: /plans/. Reads the Freeweights perk block of the Allternit plans API at view time and the
// launch limits from this Worker. Nothing priced or sized is built into the page or this file: every number is
// whatever the two APIs return. While the block reads "not_offered", each perk line carries a "Not offered yet"
// stamp, so the page never promises a perk Allternit has not switched on.
import { fmtBytes } from '/assets/islands/account.js';

const TICKET_TO_API = { free: 'free', plus: 'plus', max: 'super', ultra: 'ultra' };
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  for (const k of kids) e.append(k);
  return e;
};

export function perkValue(p) {
  if (p == null || p.value == null) return '';
  if (typeof p.value === 'boolean') return p.value ? 'Included' : 'Not included';
  if (p.unit === 'bytes') return fmtBytes(Number(p.value));
  return `${p.value}${p.unit ? ' ' + p.unit : ''}`;
}

export default async function mount(el, props) {
  const limitsEl = el.querySelector('[data-slot=limits]');
  const down = el.querySelector('[data-slot=down]');

  const limits = fetch('/api/fw/v1/limits').then((r) => (r.ok ? r.json() : null)).catch(() => null);
  let block = null;
  try {
    const r = await fetch(props.plansApi, { headers: { accept: 'application/json' } });
    if (r.ok) { const j = await r.json(); block = j && j.freeweights; }
  } catch { /* shown as the API-down state below */ }

  if (!block || typeof block !== 'object') {
    down.textContent = 'Allternit plan details could not be loaded just now, so no perks are listed. Downloads stay free on every plan. Reload to try again.';
    down.hidden = false;
  } else {
    const offered = block.status === 'offered';
    for (const t of el.querySelectorAll('.fwp-ticket')) {
      const perks = block.plans && block.plans[TICKET_TO_API[t.getAttribute('data-tier')]];
      const ul = t.querySelector('[data-slot=perks]');
      if (!ul || !Array.isArray(perks) || !perks.length) continue;
      ul.append(...perks.map((p) => {
        const li = h('li', { class: 'fwp-perk' }, h('span', {}, p.label || p.key));
        if (offered) li.append(h('b', { class: 'mono' }, perkValue(p)));
        else li.append(h('span', { class: 'fwp-notyet' }, 'Not offered yet'));
        return li;
      }));
    }
  }

  const l = await limits;
  if (l && l.limits) {
    const parts = [];
    const L = l.limits;
    if (L.file_max_bytes != null) parts.push(`${fmtBytes(L.file_max_bytes)} per file`);
    if (L.user_cap_bytes != null) parts.push(`${fmtBytes(L.user_cap_bytes)} per account`);
    if (L.repos_per_user != null) parts.push(`${L.repos_per_user} repos per account`);
    limitsEl.textContent = l.open && parts.length
      ? `Community uploads are open. Launch limits: ${parts.join(', ')}. These apply to every plan until plan perks are offered.`
      : 'Community uploads are paused right now. Downloads are not affected.';
    limitsEl.hidden = false;
  }
}
