// Account island: /account/ (signed-in card, signed-out panel) and the current-plan mark on /plans/.
// Reads GET /api/whoami-v2 with the Clerk session token. Every state is plain words; none is an error page.
//   no session            -> Sign in button (a plain link to ai.allternit.com/sign-in, works without JavaScript)
//   503 accounts_not_configured -> "Accounts open soon" (the Worker has no Clerk key yet)
//   200                   -> MemberCard for the handle and plan
//   404 profile_not_found -> MemberCard for the Clerk name, handle step opens with accounts
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
  let j = null; try { j = await res.json(); } catch { /* not JSON */ }
  const code = j && j.error;
  if (res.status === 503 && code === 'accounts_not_configured') {
    return show(memberCard('free', ''), panel(h('b', {}, 'Accounts open soon'),
      h('span', {}, 'Signing in to Freeweights is not switched on yet. Nothing is wrong with your account. Everything public still works with no account.'),
      h('a', { class: 'btn', href: '/alt.freeweights/' }, 'Browse the catalog')));
  }
  if (res.status === 401) return signedOut('Your session has ended. Sign in again to continue.');
  if (res.status === 404 && code === 'profile_not_found') {
    let name = ''; try { const c = await api.clerk(); name = (c.user && (c.user.username || c.user.firstName || '')) || ''; } catch { /* name stays empty */ }
    return show(memberCard('free', name), panel(h('b', {}, 'You are signed in'), h('span', {}, 'Choosing a Freeweights handle opens with accounts. Nothing else is needed from you now.'),
      h('button', { class: 'btn', type: 'button', 'data-act': 'sign-out' }, 'Sign out')));
  }
  if (!res.ok || !j) return show(memberCard('free', ''), note('Freeweights could not read your account just now. Reload to try again.'));
  const plan = (j.allternit && j.allternit.plan) || 'free';
  show(memberCard(plan, j.name || ''), panel(h('b', {}, `${j.fullname || j.name}`), h('span', {}, `${LABEL[tierOf(plan)]} plan`),
    h('a', { class: 'btn', href: '/plans/' }, 'See plans'), h('button', { class: 'btn', type: 'button', 'data-act': 'sign-out' }, 'Sign out')));
  body.querySelector('[data-act=sign-out]')?.addEventListener('click', () => api.signOut());
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
