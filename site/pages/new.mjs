import { page } from '../lib/registry.mjs';

// /new/: create a repo and upload to it. The static page is the no-JavaScript state: it says what the page needs
// and points at the CLI, which works without a browser. The upload island (assets/islands/upload.js) takes over
// the mount point. Nothing personal or priced is built in: limits and account state are read at view time.
// Not in the main nav until uploads are opened.
export function build() {
  page({ path: '/new/', nav: 'account', file: 'new/index.html', title: 'Upload a model or dataset', desc: 'Create a public model or dataset repo on Freeweights and upload files to it. Every file is scanned before anyone can download it.',
    body: `<link rel="stylesheet" href="/assets/fw-upload.css">
<div class="wrap page-head">
  <div class="eyebrow mono"><b>alt</b>.freeweights.new</div>
  <h1 class="ph1">Upload</h1>
  <p class="lead">Share a model or dataset with a free Allternit account. Repos are public, and every file is scanned before anyone can download it.</p>
</div>
<div class="wrap fwu" data-fw-island="upload" data-page="new">
  <div data-slot="app"><div class="fwu-note">Uploading from this page needs JavaScript. Without it, use the <code>fw</code> command line tool or <code>huggingface_hub</code> with <code>HF_ENDPOINT=https://freeweights.allternit.com</code> and <code>HF_HUB_DISABLE_XET=1</code>.</div></div>
</div>
<script src="/assets/fw-islands.js" defer></script>` });
}
