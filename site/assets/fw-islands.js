// Island loader (see islands/README.md). Finds [data-fw-island], imports /assets/islands/<name>.js once and calls
// its default export as mount(el, props, api). `api` is the account interface from spec/accounts-v1.md section 6.
// Anonymous visitors load no third-party script: clerk-js is fetched only after a Sign in click or when the
// __client_uat cookie says a session may exist (the account island decides; signedIn() never loads it).
(() => {
  const CLERK_KEY = 'pk_live_Y2xlcmsuYWxsdGVybml0LmNvbSQ'; // publishable key (public); frontend API clerk.allternit.com
  const CLERK_JS = 'https://clerk.allternit.com/npm/@clerk/clerk-js@5.127.2/dist/clerk.browser.js';
  const SIGN_IN = 'https://ai.allternit.com/sign-in';

  const hint = () => /(?:^|;\s*)__client_uat(?:_[A-Za-z0-9]+)?=(?!0(?:;|$))\d/.test(document.cookie);
  let clerkP = null;
  const loadClerk = () => clerkP || (clerkP = new Promise((resolve, reject) => {
    const done = async () => { try { await window.Clerk.load(); resolve(window.Clerk); } catch (e) { reject(e); } };
    if (window.Clerk && window.Clerk.loaded) return resolve(window.Clerk);
    const s = document.createElement('script');
    s.src = CLERK_JS; s.async = true; s.crossOrigin = 'anonymous';
    s.setAttribute('data-clerk-publishable-key', CLERK_KEY);
    s.onload = done; s.onerror = () => { clerkP = null; reject(new Error('clerk-js did not load')); };
    document.head.appendChild(s);
  }));
  const token = async () => {
    if (!hint()) return null;
    try { const c = await loadClerk(); return c.session ? await c.session.getToken() : null; } catch { return null; }
  };
  const api = {
    signedIn: hint,
    token,
    clerk: loadClerk,
    signInUrl: (back = location.href) => `${SIGN_IN}?redirect_url=${encodeURIComponent(back)}`,
    signIn() { location.assign(api.signInUrl()); },
    async signOut() { try { const c = await loadClerk(); await c.signOut(); } catch { /* fall through to reload */ } location.reload(); },
    async fetch(path, init = {}) {
      const t = await token();
      const headers = new Headers(init.headers || {});
      if (t) headers.set('authorization', `Bearer ${t}`);
      return fetch(path, { ...init, headers });
    },
  };

  const seen = new Map();
  for (const el of document.querySelectorAll('[data-fw-island]')) {
    const name = el.getAttribute('data-fw-island');
    if (!/^[a-z0-9-]+$/.test(name)) continue;
    if (!seen.has(name)) seen.set(name, import(`/assets/islands/${name}.js`));
    seen.get(name).then((m) => m.default(el, { ...el.dataset }, api)).catch(() => { /* the fallback text stays */ });
  }
})();
