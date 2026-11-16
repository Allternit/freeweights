import type { Env, RepoRow } from '../types';
import { THEME_SCRIPT } from '../data.generated';
// The pure Markdown core, shared with the static site (site/lib/markdown.mjs re-exports it). It has no Node imports,
// so wrangler bundles it. The same safe renderer the catalog uses for publisher READMEs: no raw HTML, no images
// loaded, no javascript: links, relative links only to our own resolve URLs.
import { md, esc } from '../../../site/lib/md-core.mjs';

export const ORIGIN = 'https://freeweights.allternit.com';

/** One file of a commit tree (the shape of a manifest `files` entry, plus the scan state of the file). */
export interface RepoTreeFile {
  path: string;
  size: number;
  sha256: string;
  /** Default 'clean'. A 'held' file is listed but not linked; a 'scanning' one reads "Scanning". */
  state?: 'clean' | 'scanning' | 'held';
}
/** What renderRepoPage needs besides the repo row: the head commit's tree and, if there is one, README.md's text. */
export interface RepoTree {
  commit: string;
  files: RepoTreeFile[];
  /** Text of README.md at the head commit (the caller reads it from the clean blob; omit for none). Capped at 200 KB here. */
  readme?: string | null;
  /** Handle of the uploader, shown on the page. Defaults to the repo's namespace. */
  owner?: string;
}

/**
 * Path of a community repo page (spec/accounts-v1.md section 3): models at /alt.freeweights.community/<ns>/<name>/,
 * datasets at /alt.freeweights.community/datasets/<ns>/<name>/ and apps at .../apps/<ns>/<name>/ (HF style), so a
 * model and a dataset with the same name never share a page. "datasets" and "apps" are reserved handles.
 */
type PageRef = { kind?: string | null; namespace: string; name: string };
export const repoPagePath = (repo: PageRef) =>
  `alt.freeweights.community/${repo.kind === 'dataset' ? 'datasets/' : repo.kind === 'app' ? 'apps/' : ''}${repo.namespace}/${repo.name}`;
/** R2 key (bucket FW) of a community repo page. */
export const repoPageKey = (repo: PageRef) => `${repoPagePath(repo)}/index.html`;
export const repoPageUrl = (repo: PageRef) => `/${repoPagePath(repo)}/`;

const bytes = (n: number) => {
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; let v = Number(n) || 0;
  while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
  return (v >= 100 || i === 0 ? String(Math.round(v)) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + u[i];
};
const encPath = (p: string) => p.split('/').map(encodeURIComponent).join('/');
const resolveBase = (r: Pick<RepoRow, 'kind' | 'namespace' | 'name'>) => `${ORIGIN}${r.kind === 'dataset' ? '/datasets' : ''}/${r.namespace}/${r.name}/resolve/main/`;
const stripFront = (s: string) => s.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
const MAX_README = 200_000;

/** The page frame shared by community pages: the head, header, footer and scripts of the static site, minus the catalog-only parts. */
export function communityShell(opts: { path: string; title: string; desc: string; body: string; robots?: string }): string {
  const full = `${opts.title} · Allternit Freeweights`;
  const nav: [string, string][] = [['Catalog', '/alt.freeweights/'], ['Community', '/alt.freeweights.community/'], ['Wanted', '/wanted/'], ['Mirrors', '/mirrors/'], ['Ledger', '/ledger/'], ['Docs', '/docs/']];
  const links = nav.map(([l, h]) => `<a href="${h}"${h === '/alt.freeweights.community/' ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(opts.desc)}">${opts.robots ? `\n<meta name="robots" content="${esc(opts.robots)}">` : ''}
<link rel="canonical" href="${ORIGIN}${opts.path}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:url" content="${ORIGIN}${opts.path}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<script>${THEME_SCRIPT}</script>
<link rel="stylesheet" href="/assets/fw.css">
<link rel="stylesheet" href="/assets/fw-upload.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
  <a class="brand" href="/" aria-label="Allternit Freeweights home"><b>Allternit</b> Freeweights</a>
  <nav class="nav" aria-label="Main">${links}</nav>
  <button class="iconbtn theme" type="button" data-theme-toggle aria-label="Change theme"><span class="sun">Light</span><span class="moon">Dark</span></button>
</div></header>
<main id="main">
${opts.body}
</main>
<footer class="foot"><div class="wrap">
  <div class="f-top"><nav aria-label="Footer"><a href="/alt.freeweights/">Catalog</a><a href="/alt.freeweights.community/">Community</a><a href="/operating-statement/#takedown-counter">Takedowns</a><a href="/ledger/">Ledger</a><a href="/mirrors/">Mirrors</a><a href="/docs/">Docs</a></nav></div>
  <div class="f-line"><b>Allternit, the open source alternative.</b> Community uploads are made by their owners and are not reviewed by Allternit beyond an automated scan.</div>
</div></footer>
<script src="/assets/fw-islands.js" defer></script>
<script src="/assets/fw.js" defer></script>
</body>
</html>
`;
}

/** The HTML of a community repo page (pure: no I/O). */
export function repoPageHtml(repo: RepoRow, tree: RepoTree): string {
  const id = `${repo.namespace}/${repo.name}`;
  const files = [...tree.files].sort((a, b) => (a.path < b.path ? -1 : 1));
  const total = files.reduce((a, f) => a + (f.size || 0), 0);
  const held = files.filter((f) => f.state === 'held');
  const kindLabel = repo.kind === 'dataset' ? 'Dataset' : 'Model';
  const base = resolveBase(repo);
  const rows = files.map((f) => {
    const st = f.state || 'clean';
    const cell = st === 'clean' ? `<a class="link" href="${esc(`${repo.kind === 'dataset' ? '/datasets' : ''}/${repo.namespace}/${repo.name}/resolve/main/${encPath(f.path)}`)}" rel="nofollow">${esc(f.path)}</a>`
      : `${esc(f.path)} <span class="fwc-hold">${st === 'held' ? 'Held for review' : 'Scanning'}</span>`;
    return `<tr${st === 'held' ? ' class="fwc-held"' : ''}><td class="path">${cell}</td><td class="r mono">${bytes(f.size)}</td><td class="hash full">${esc(f.sha256)}</td></tr>`;
  }).join('');
  const readmeSrc = tree.readme ? stripFront(String(tree.readme).slice(0, MAX_README)) : '';
  const readme = readmeSrc.trim()
    ? `<section class="mpanel"><h2 class="panel-h h2">README</h2><div class="prose fwc-readme">${md(readmeSrc, { safe: true, keepH1: true, base }).html}</div><p class="small sub">Written by the owner. Allternit has not checked what it says.</p></section>`
    : `<section class="mpanel"><h2 class="panel-h h2">README</h2><p class="sub">The owner has not added a README.</p></section>`;
  const cmd = `HF_ENDPOINT=${ORIGIN} hf download ${id}${repo.kind === 'dataset' ? ' --repo-type dataset' : ''}`;
  const body = `
<div class="wrap page-head m-head">
  <div class="eyebrow mono"><a class="more" href="/alt.freeweights.community/">community</a> / <b>${esc(id)}</b></div>
  <h1 class="ph1">${esc(repo.name)}</h1>
  <div class="meta m-meta"><span class="badges"><span class="fwc-badge">Community upload</span></span><span class="mono m-id">${esc(kindLabel)} by ${esc(tree.owner || repo.namespace)}</span>${repo.license_id ? `<span>License: ${esc(repo.license_id)}</span>` : '<span>License: not stated</span>'}<span>Updated ${esc(String(repo.updated_at).slice(0, 10))}</span></div>
  <div class="notice"><span><b>Uploaded by a community member.</b> Every file passed an automated scan for malware, secrets and unsafe formats. That is not a review of what the files do or whether the licence is right.</span></div>
  ${held.length ? `<div class="notice err" style="margin-top:8px"><span><b>${held.length === 1 ? 'One file is' : held.length + ' files are'} held.</b> Held files did not pass the scan and cannot be downloaded. The owner can see the reason under My repos on their account page.</span></div>` : ''}
</div>
<div class="wrap mgrid">
  <div class="col">
    ${readme}
    <section class="mpanel"><h2 class="panel-h h2">Files</h2>
      <div class="box"><div class="pad files-h"><b>${files.length} file${files.length === 1 ? '' : 's'} · ${bytes(total)}</b><span class="sub small">Commit ${esc(tree.commit.slice(0, 12))}. Sizes and sha256 as uploaded and checked by the scanner.</span></div>
      <div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>File</th><th class="r">Size</th><th>sha256</th></tr></thead><tbody>${rows}</tbody></table></div></div>
    </section>
  </div>
  <div class="col side">
    <div class="box pad act"><div class="box-h" style="margin:0">Get it</div>
      <pre class="block"><code>${esc(cmd)}</code></pre>
      <p class="sub small" style="margin:6px 0 0">Downloads need no account.</p></div>
    <div class="box pad fwc-side">
      <div class="box-h" style="margin:0">Something wrong with this repo?</div>
      <div data-fw-island="report" data-repo="${esc(repo.id)}" data-name="${esc(id)}"><span class="small sub">To report this repo, email the takedown mailbox listed on the <a class="link" href="/operating-statement/#takedown-counter">takedowns page</a>.</span></div>
    </div>
  </div>
</div>`;
  return communityShell({ path: repoPageUrl(repo), title: id, desc: `${id}: a community-uploaded ${kindLabel.toLowerCase()} on Freeweights, scanned before download. ${files.length} files.`, body });
}

/**
 * Render a community repo page into R2 (bucket FW). Called by the scan result handler when a repo is promoted to
 * `live`, and again whenever a live repo's tree changes.
 *
 *   renderRepoPage(env, repo, tree) -> Promise<{ key: string; bytes: number }>
 *
 * `repo` is the repos row (source 'community', public); `tree` is the head commit's files with their scan
 * states and, optionally, README.md's text (see RepoTree). The page is written to `repoPageKey(repo)`
 * (alt.freeweights.community/<ns>/<name>/index.html) and served by the Cloud Connector straight from R2.
 * Callers refresh the community index afterwards (renderCommunityIndex). Throws if the repo is private,
 * not a community repo, or removed (a removed repo's page is deleted with removeRepoPage instead).
 */
export async function renderRepoPage(env: Env, repo: RepoRow, tree: RepoTree): Promise<{ key: string; bytes: number }> {
  if (repo.source !== 'community' || repo.private) throw new Error('renderRepoPage: only public community repos get a page');
  if (repo.status === 'removed') throw new Error('renderRepoPage: repo is removed');
  const html = repoPageHtml(repo, tree);
  const key = repoPageKey(repo);
  await env.FW.put(key, html, { httpMetadata: { contentType: 'text/html; charset=utf-8', cacheControl: 'public, max-age=300, no-transform' } });
  return { key, bytes: html.length };
}

/** Delete a repo's page (takedown, owner deletion, hold). On Connector paths a removed page is a 404, not a 451. */
export async function removeRepoPage(env: Env, repo: PageRef): Promise<void> {
  await env.FW.delete(repoPageKey(repo));
}
