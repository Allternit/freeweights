import { page } from '../lib/registry.mjs';

// /plans/: one PlanTicket per Allternit plan. Plans are subscription types, never account types. No price and no
// perk number is built into the site (parity plan D10): numbers come from Allternit when they are published.
// The account island marks the visitor's current plan. Hidden from the nav until wave 3.
const PLANS = [
  ['free', 'Free', 'Browse the catalog, download any model and verify every file.'],
  ['plus', 'Plus', 'Plan limits are being finalised.'],
  ['max', 'Max', 'Plan limits are being finalised.'],
  ['ultra', 'Ultra', 'Plan limits are being finalised.'],
];
const ticket = ([tier, label, line]) => `<li class="fwp fwp-ticket" data-tier="${tier}"><div class="fwp-ticket-main"><span class="fwp-stamp">${label.toUpperCase()}</span><ul><li>${line}</li><li>Downloads stay free on every plan, with no account.</li></ul></div><div class="fwp-ticket-stub">${tier === 'free' ? '<span class="fwp-stamp">Included</span>' : '<a class="fwp-stamp" href="https://ai.allternit.com/?view=settings&amp;section=billing" rel="noopener">See in Allternit</a>'}</div><i class="n1" aria-hidden="true"></i><i class="n2" aria-hidden="true"></i></li>`;

export function build() {
  page({ path: '/plans/', nav: 'plans', file: 'plans/index.html', title: 'Plans', desc: 'Allternit plans on Freeweights. Downloads are free on every plan and need no account.',
    body: `<link rel="stylesheet" href="/assets/fw-plans.css">
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.plans</div>
  <h1 class="ph1">Plans</h1>
  <p class="lead">Plans are how you subscribe to Allternit. They are not account types, and downloads are free on every one.</p>
</div>
<div class="wrap" style="padding-bottom:40px" data-fw-island="account" data-page="plans">
  <ul class="fwp-tickets" aria-label="Allternit plans">${PLANS.map(ticket).join('')}</ul>
  <p class="small sub" style="margin-top:16px">Limits and prices are managed in Allternit Settings, Billing. Freeweights never shows a number that Allternit has not published.</p>
</div>
<script src="/assets/fw-islands.js" defer></script>` });
}
