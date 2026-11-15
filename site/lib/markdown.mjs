import path from 'node:path';
import { ROOT } from './env.mjs';
import { esc, exists, ls, rd } from './util.mjs';
import { ICON } from './faces.mjs';

export const CONTENT_DIR = path.join(ROOT, 'site/content');
export function parseFront(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/); const fm = {}; let body = src;
  if (m) { body = src.slice(m[0].length); m[1].split('\n').forEach((l) => { const k = l.match(/^([A-Za-z0-9_-]+):\s*(.*)$/); if (k && k[2] !== '') fm[k[1]] = k[2].replace(/^["']|["']$/g, '').trim(); }); }
  return { fm, body };
}
export const content = (rel) => { const f = path.join(CONTENT_DIR, rel); if (!exists(f)) return null; try { return parseFront(rd(f)); } catch (e) { console.warn('content unreadable', rel, e.message); return null; } };
// Internal links written as repo paths or .md files map to site pages.
export function mapHref(u) {
  if (/^(https?:|mailto:|#)/.test(u)) return u;
  const s = u.replace(/^\.?\//, '');
  if (/^(ethos|mission|charter|operating-statement)(\.md)?\/?$/.test(s)) return CHARTER_PATH;
  const d = s.match(/^(?:site\/content\/)?docs\/([\w-]+)\.md(#.*)?$/) || s.match(/^([\w-]+)\.md(#.*)?$/);
  if (d) { const slug = d[1]; if (['ledger', 'wanted', 'mirrors'].includes(slug)) return `/${slug}/${d[2] || ''}`; if (slug === 'home') return '/'; return `/docs/${slug === 'index' ? '' : slug + '/'}${d[2] || ''}`; }
  if (/^\/alt\.freeweights$/.test(u)) return '/alt.freeweights/';
  return u;
}
export let codeSeq = 0;
export function codeHtml(code, lang) {
  const id = 'cb' + (++codeSeq);
  return `<div class="code-block"><pre class="block"><code id="${id}"${lang ? ` data-lang="${esc(lang)}"` : ''}>${esc(code)}</code></pre><button class="copy" type="button" data-copy="${id}">${ICON.copy}Copy</button></div>`;
}
export function inline(s) {
  const codes = [];
  s = String(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, t, u) => { const h = mapHref(u.replace(/&amp;/g, '&')); return `<a class="link" href="${esc(h)}"${/^https?:/.test(h) ? ' rel="noopener"' : ''}>${t}</a>`; });
  s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a class="link" href="$1" rel="noopener">$1</a>');
  s = s.replace(/\b([\w.+-]+@allternit\.com)\b/g, '<a class="link" href="mailto:$1">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<i>$2</i>').replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<i>$2</i>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, n) => `<code>${esc(codes[n])}</code>`);
}
export const plain = (s) => String(s).replace(/`([^`]+)`/g, '$1').replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
export function listHtml(lines, inl = inline) {
  const base = lines[0].match(/^\s*/)[0].length; const ordered = /^\s*\d+[.)]\s/.test(lines[0]); const items = [];
  for (const l of lines) {
    const ind = l.match(/^\s*/)[0].length; const mk = l.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (mk && ind <= base + 1) items.push({ text: [mk[2]], sub: [] });
    else if (items.length) { const it = items[items.length - 1]; if (mk || it.sub.length) it.sub.push(l); else if (l.trim()) it.text.push(l.trim()); }
  }
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((it) => { const sub = it.sub.filter((x) => x.trim()); return `<li>${inl(it.text.join(' '))}${sub.length ? listHtml(sub, inl) : ''}</li>`; }).join('')}</${tag}>`;
}

// ---------- Safe renderer for third-party Markdown (publisher READMEs, later user posts) ----------
// Rules: no raw HTML ever reaches the output. Every character of input text is escaped. HTML tags are
// dropped (never passed through); <img>/<a> are first rewritten to Markdown so the link rules below apply.
// Links: http, https, mailto, same-page #anchors only (rel="noopener nofollow ugc"); relative links resolve
// against opts.base (the publisher's tree at the pinned commit) or lose the link. Link titles are dropped.
// Images are never loaded (no third-party request on page load): each becomes a link to the picture.
// The output is built only from our own tags, so a corpus test can assert on the whole result.
const SAFE_REL = 'noopener nofollow ugc';
const mdSlug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 's';
export function safeUrl(u, base) {
  const raw = String(u || '').replace(/[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g, '');
  if (!raw) return null;
  if (raw[0] === '#') return '#mc-' + mdSlug(decodeURIComponentSafe(raw.slice(1)));
  const scheme = raw.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    if (!/^(https?|mailto)$/i.test(scheme[1])) return null;
    if (/^mailto$/i.test(scheme[1])) return /^mailto:[\w.+%-]+@[\w.-]+$/i.test(raw) ? raw : null;
    try { const x = new URL(raw); return /^https?:$/.test(x.protocol) && x.hostname ? x.href : null; } catch (e) { return null; }
  }
  if (raw.startsWith('//') || raw.startsWith('\\') || !base) return null;
  try { const x = new URL(raw.replace(/^\.?\//, ''), base); return /^https:$/.test(x.protocol) && x.hostname === new URL(base).hostname ? x.href : null; } catch (e) { return null; }
}
const decodeURIComponentSafe = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
// Tags to rewrite or drop, applied outside code only.
function preHtml(text) {
  let t = text.replace(/<(script|style|iframe|object|embed|svg|math|template|noscript)\b[\s\S]*?<\/\1\s*>/gi, '');
  const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')); return m ? (m[1] ?? m[2] ?? m[3] ?? '') : ''; };
  const enc = (u) => u.replace(/[\s()<>"\\]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
  const clean = (a) => a.replace(/[\[\]\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/<img\b[^<>]*>/gi, (tag) => { const src = attr(tag, 'src'); return src ? `![${clean(attr(tag, 'alt'))}](${enc(src)})` : ''; });
  t = t.replace(/<a\b([^<>]*)>([\s\S]*?)<\/a\s*>/gi, (_, a, inner) => { const href = attr(a, 'href'); const txt = clean(inner.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^<>]*>/g, '')); return href ? `[${txt || href}](${enc(href)})` : txt; });
  t = t.replace(/<br\s*\/?>/gi, '\n').replace(/<h([1-6])\b[^<>]*>/gi, (_, n) => '\n\n' + '#'.repeat(+n) + ' ').replace(/<\/(h[1-6]|p|div|tr|li|details|summary|table|center)\s*>/gi, '\n\n');
  t = t.replace(/<(td|th)\b[^<>]*>/gi, ' | ').replace(/<hr\b[^<>]*>/gi, '\n\n---\n\n');
  return t.replace(/<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*)?\/?>/g, '');
}
// Run fn on prose only: fenced blocks are normalised to ``` and left alone; inline code spans are skipped.
function mapProse(src, fn) {
  const lines = String(src).split('\n'); const out = []; let prose = []; let fence = null;
  const flush = () => { if (prose.length) { out.push(prose.join('\n').split(/(`+[^`\n]*`+)/).map((p, i) => (i % 2 ? p : fn(p))).join('')); prose = []; } };
  for (const l of lines) {
    const f = l.match(/^ {0,3}(`{3,}|~{3,})\s*([\w+.-]*)[^`]*$/);
    if (fence) { if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2]) { out.push('```'); fence = null; } else out.push(l); continue; }
    if (f) { flush(); fence = f[1]; out.push('```' + f[2]); continue; }
    prose.push(l);
  }
  flush();
  return out.join('\n');
}
export function inlineSafe(opts = {}) {
  return function inl(input) {
    const store = []; const ph = (html) => { store.push(html); return `\u0001${store.length - 1}\u0001`; };
    let s = String(input).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '');
    const anchor = (href, inner) => ph(`<a class="link" href="${esc(href)}" rel="${SAFE_REL}" target="_blank">${inner}</a>`);
    const fmt = (x) => esc(x).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<i>$2</i>').replace(/(^|[^\w])_([^_\s][^_\n]*?)_(?!\w)/g, '$1<i>$2</i>').replace(/~~([^~\n]+)~~/g, '<s>$1</s>');
    s = s.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (_, __, c) => ph(`<code>${esc(c.trim())}</code>`));
    s = s.replace(/(?<!!)\[((?:[^\[\]\n]|!\[[^\]\n]*\]\([^)\n]*\))*)\]\(\s*<?([^\s)>]*)>?(?:\s+(?:"[^"\n]*"|'[^'\n]*'))?\s*\)/g, (all, text, url) => {
      const href = safeUrl(url, opts.base); const label = text.replace(/!\[([^\]\n]*)\]\([^)\n]*\)/g, '$1');
      return href ? anchor(href, fmt(label.trim() || url)) : ph(fmt(label));
    });
    s = s.replace(/!\[([^\]\n]*)\]\(\s*<?([^\s)>]*)>?(?:\s+(?:"[^"\n]*"|'[^'\n]*'))?\s*\)/g, (all, alt, url) => {
      const href = safeUrl(url, opts.base); const label = alt.trim() || 'image';
      return href ? anchor(href, `<span class="md-img">Image: ${esc(label)}</span>`) : ph(esc(label));
    });
    s = s.replace(/<((?:https?:\/\/|mailto:)[^\s<>]+)>/gi, (all, u) => { const h = safeUrl(u); return h ? anchor(h, esc(u)) : ph(esc(all)); });
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<>()\[\]]+[^\s<>()\[\].,;:!?'"])/g, (all, pre, u) => { const h = safeUrl(u); return h ? pre + anchor(h, esc(u)) : all; });
    s = fmt(s);
    for (let i = 0; i < 4 && /\u0001\d+\u0001/.test(s); i++) s = s.replace(/\u0001(\d+)\u0001/g, (_, n) => store[n]);
    return s.replace(/\u0001\d*\u0001?/g, '');
  };
}
// Small Markdown renderer: headings with {#id}, paragraphs, lists, tables, fences, quotes, rules.
export function md(src, opts = {}) {
  const safe = !!opts.safe; const inl = safe ? (opts.inl || inlineSafe(opts)) : inline;
  let text = String(src).replace(/\r/g, '');
  if (safe) text = mapProse(text, (p) => preHtml(p.replace(/<!--[\s\S]*?-->/g, '')));
  const lines = text.replace(/<!--[\s\S]*?-->/g, safe ? '' : '').split('\n');
  const out = []; const toc = []; let title = null; const ids = opts.ids || new Set();
  const slug = (t, want) => { let s = want || plain(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 's'; const b = s; let i = 2; while (ids.has(s)) s = b + '-' + i++; ids.add(s); return s; };
  const isStart = (l) => /^(#{1,6})\s|^```|^\s*>|^\s*([-*+]|\d+[.)])\s|^\s*\|.*\|\s*$|^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l);
  let i = 0;
  while (i < lines.length) {
    const l = lines[i]; let m;
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(/^```\s*([\w+-]*)/))) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(codeHtml(buf.join('\n'), m[1])); continue; }
    if ((m = l.match(safe ? /^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/ : /^(#{1,6})\s+(.*?)\s*$/))) {
      let lv = m[1].length; let text = m[2]; let want = null; const a = safe ? null : text.match(/\s*\{#([\w-]+)\}\s*$/); if (a) { want = a[1]; text = text.slice(0, a.index); }
      if (safe) { if (!text.trim()) { i++; continue; } lv = Math.min(6, lv + (opts.shift ?? 2)); }
      else if (lv === 1 && !title && !opts.keepH1) { title = text; i++; continue; }
      const id = safe ? 'mc-' + slug(text, mdSlug(text)) : slug(text, want); if (lv <= 3) toc.push({ lv, id, text: plain(text) });
      out.push(`<h${lv} id="${id}">${inl(text)}<a class="anchor" href="#${id}" aria-label="Link to ${esc(plain(text))}">#</a></h${lv}>`); i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\s*>/.test(l)) { const buf = []; while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, '')); if (safe) buf[0] = buf[0].replace(/^\[!(\w+)\]\s*/, (_, k) => `**${k[0].toUpperCase()}${k.slice(1).toLowerCase()}.** `);
    out.push(`<blockquote>${md(buf.join('\n'), { ids, safe, inl, base: opts.base, shift: opts.shift }).html}</blockquote>`); continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const row = (x) => x.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = row(l); i += 2; const body = []; while (i < lines.length && /^\s*\|/.test(lines[i])) body.push(row(lines[i++]));
      out.push(`<div class="box tblbox"><div class="tbl-wrap"><table class="tbl"><thead><tr>${head.map((h) => `<th>${inl(h)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`); continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s/.test(l)) {
      const buf = [];
      while (i < lines.length && (lines[i].trim() === '' ? (i + 1 < lines.length && /^(\s+\S|\s*([-*+]|\d+[.)])\s)/.test(lines[i + 1])) : (/^\s*([-*+]|\d+[.)])\s/.test(lines[i]) || /^\s+\S/.test(lines[i])))) buf.push(lines[i++]);
      out.push(listHtml(buf.filter((x) => x.trim()), inl)); continue;
    }
    const buf = []; while (i < lines.length && lines[i].trim() && !isStart(lines[i])) buf.push(lines[i++]);
    if (!buf.length) buf.push(lines[i++]);
    out.push(`<p>${inl(buf.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc, title };
}
// Split a body into "## Heading {#id}" sections. fields=true reads "key: value" lines (home.md style).
export function mdSections(body, fields = false) {
  const secs = []; let cur = { id: '_intro', title: '', lines: [] };
  let fence = false;
  for (const l of String(body).replace(/\r/g, '').split('\n')) {
    if (/^```/.test(l)) fence = !fence;
    const m = !fence && l.match(/^##\s+(.*?)\s*(?:\{#([\w-]+)\})?\s*$/);
    if (m) { secs.push(cur); cur = { id: m[2] || m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: m[1], lines: [] }; } else cur.lines.push(l);
  }
  secs.push(cur);
  return secs.map((s) => {
    const f = {}; let lines = s.lines;
    if (fields) lines = lines.filter((l) => { const k = l.match(/^([a-z_]+):\s+(.+)$/); if (!k) return true; let v = k[2].trim(); const o = v.match(/^\{(.*)\}$/); if (o) { v = {}; o[1].split(/,\s*(?=\w+:)/).forEach((p) => { const kv = p.match(/^(\w+):\s*(.*)$/); if (kv) v[kv[1]] = kv[2].trim(); }); } f[k[1]] = v; return false; });
    return { ...s, fields: f, md: lines.join('\n') };
  }).filter((s) => s.id !== '_intro' || s.md.trim());
}
// Render a content page; inject[id](html) can add generated parts to a section.
export function renderContent(doc, inject = {}) {
  const ids = new Set(); const toc = []; let html = '';
  for (const s of mdSections(doc.body)) {
    let inner = md(s.md, { ids }); toc.push(...inner.toc);
    let h = inner.html;
    if (inject[s.id]) h = inject[s.id](h);
    if (s.id === '_intro') { html += `<div class="intro">${h}</div>`; continue; }
    ids.add(s.id); toc.push({ lv: 2, id: s.id, text: plain(s.title) });
    html += `<section class="csec" id="${esc(s.id)}"><h2 class="h2">${inline(s.title)}<a class="anchor" href="#${esc(s.id)}" aria-label="Link to ${esc(plain(s.title))}">#</a></h2>${h}</section>`;
  }
  const order = toc.filter((t) => t.lv === 2); // keep h2 order as written
  const sorted = []; for (const s of mdSections(doc.body)) { if (s.id === '_intro') continue; const t = order.find((x) => x.id === s.id); if (t) sorted.push(t); const sub = md(s.md, { ids: new Set() }).toc.filter((x) => x.lv === 3); sub.forEach((x) => sorted.push({ ...x, lv: 3 })); }
  return { html, toc: sorted };
}
export const tocHtml = (toc, label = 'On this page') => toc.length ? `<nav class="otp" aria-label="${esc(label)}"><div class="otp-h">${esc(label)}</div>${toc.filter((t) => t.lv <= 2 || toc.length < 18).map((t) => `<a class="lv${t.lv}" href="#${esc(t.id)}">${esc(t.text)}</a>`).join('')}</nav>` : '';

export const HOME = content('home.md');
export const MISSION_DOC = content('mission.md');
export const LEDGER_DOC = content('ledger.md');
export const WANTED_DOC = content('wanted.md');
export const MIRRORS_DOC = content('mirrors.md');
export const CHARTER_LABEL = (MISSION_DOC && MISSION_DOC.fm.nav_label) || 'Operating Statement';
// The page path follows the nav label; old paths (/ethos, /charter) redirect to it.
export const CHARTER_PATH = '/' + CHARTER_LABEL.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '/';
export const OLD_CHARTER = ['/ethos/', '/charter/', '/operating-statement/'].filter((o) => o !== CHARTER_PATH);
export const DOCS = ls(path.join(CONTENT_DIR, 'docs'), /\.md$/).map((f) => { const d = parseFront(rd(f)); const slug = path.basename(f, '.md'); return { ...d, slug, url: slug === 'index' ? '/docs/' : `/docs/${slug}/`, title: d.fm.title || slug, label: d.fm.nav_label || d.fm.title || slug, group: d.fm.group || '', order: Number(d.fm.order) || 99 }; })
  .sort((a, b) => (a.slug === 'index' ? -1 : b.slug === 'index' ? 1 : a.order - b.order || a.title.localeCompare(b.title)));


// Render untrusted Markdown to safe HTML. opts.base resolves relative links (an https URL on the same host).
export const mdSafe = (src, opts = {}) => md(src, { ...opts, safe: true, keepH1: true }).html;
