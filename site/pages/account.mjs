import { ORIGIN } from '../lib/env.mjs';
import { page } from '../lib/registry.mjs';
import { esc } from '../lib/util.mjs';

// /account/: the MemberCard and sign-in. The static page is the signed-out state and works without JavaScript
// (Sign in is a plain link). The account island fills the card from GET /api/whoami-v2 at view time; nothing
// personal is built into the page. Not in the main nav until wave 3.
export function build() {
  const back = encodeURIComponent(`${ORIGIN}/account/`);
  page({ path: '/account/', nav: 'account', file: 'account/index.html', title: 'Account', desc: 'Your Allternit account on Freeweights. Downloads stay free and need no account.',
    body: `<link rel="stylesheet" href="/assets/fw-plans.css">
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.account</div>
  <h1 class="ph1">Account</h1>
  <p class="lead">One Allternit account works here and in the Allternit apps. Downloads stay free and need no account.</p>
</div>
<div class="wrap fwa" data-fw-island="account" data-page="account">
  <div class="fwa-side" data-slot="card"><div class="fwp fwp-card is-empty" data-tier="free" role="img" aria-label="Free plan card"><div class="fwp-card-top"><img src="/assets/plans/wordmark-ink.svg" alt="A://TERNIT" width="510" height="50"><span class="fwp-stamp">FREE</span></div><div class="fwp-card-bot"><small>MEMBER</small><b>Not signed in</b></div></div></div>
  <div data-slot="body"><div class="fwa-panel"><b>Sign in with your Allternit account</b><span>One account for Allternit and Freeweights. Downloads stay free and need no account.</span><a class="btn solid" href="https://ai.allternit.com/sign-in?redirect_url=${esc(back)}" data-act="sign-in">Sign in</a></div></div>
</div>
<script src="/assets/fw-islands.js" defer></script>` });
}
