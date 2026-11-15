import path from 'node:path';
import { page } from '../lib/registry.mjs';

export function build() {
page({ path: '/404.html', nav: '', file: '404.html', title: 'Not found', body: `
<div class="wrap page-head" style="padding-bottom:60px">
  <div class="eyebrow mono"><b>alt</b>.freeweights.404</div>
  <h1 class="ph1">Not found</h1>
  <p class="lead">This page or model is not in the catalog. If a model lost its source, it may be on the <a class="link" href="/wanted/">Wanted</a> list.</p>
  <p style="margin-top:16px"><a class="btn pri" href="/alt.freeweights/">Browse the catalog</a></p>
</div>` });
}
