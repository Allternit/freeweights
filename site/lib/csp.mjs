// The one Content-Security-Policy for every HTML page Freeweights serves. Shared by the static build (writes
// dist/_headers for Cloudflare Pages) and the Worker (worker/scripts/build-data.mjs bakes it into
// data.generated.ts; the Worker adds it to every text/html reply it serves or proxies). Zero dependencies.
import { createHash } from 'node:crypto';

// The only inline script on any page: sets the saved theme before first paint. Its hash goes in script-src.
// Change this text and the hash changes with it; build.mjs fails if a page carries any other inline script.
export const THEME_SCRIPT = "(function(d){d.classList.add('js');try{var t=localStorage.getItem('fw-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}})(document.documentElement)";
export const THEME_SCRIPT_HASH = `'sha256-${createHash('sha256').update(THEME_SCRIPT).digest('base64')}'`;

// Decisions (see spec/accounts-v1.md section 10 and the parity plan section 6):
//  script-src   'self' + the one hash. No 'unsafe-inline', no 'unsafe-eval'. JSON data blocks are not executed.
//  style-src    'self' + 'unsafe-inline': pages use style="" attributes (meters, spacing) in server markup and in
//               markup the islands build. Styles cannot run script; the README renderer never emits style.
//  img-src      'self' data: only. Publisher READMEs are rendered by site/lib/markdown.mjs, which turns every
//               image into a text link, so no page loads a third-party image. If README images are ever
//               inlined, this is the line to widen (to https:), and it should then be reviewed.
//  connect-src  'self' + clerk.allternit.com: islands fetch catalog JSON and the Worker API on this origin; the
//               account island talks to Clerk's frontend API after a Sign in click or a __client_uat hint.
//  script-src   also names https://clerk.allternit.com, the only host clerk-js loads from (pinned version, same
//               rule: no other third-party script). Anonymous pages never request it.
//  frame-ancestors 'none': no page is meant to be embedded. form-action 'self': the only form is the search form.
export const CSP = [
  "default-src 'none'",
  `script-src 'self' ${THEME_SCRIPT_HASH} https://clerk.allternit.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://clerk.allternit.com",
  "manifest-src 'self'",
  "frame-src 'none'",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS = {
  'content-security-policy': CSP,
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

/** Returns the offending inline scripts of an HTML string: executable inline scripts whose body is not THEME_SCRIPT. */
export function badInlineScripts(html) {
  const bad = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([^]*?)<\/script>/gi)) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (type && !/^(text|application)\/(javascript|ecmascript|module)$|^module$/i.test(type)) continue; // data block (application/json): not executed
    if (m[2] !== THEME_SCRIPT) bad.push(m[0].slice(0, 80));
  }
  for (const m of html.matchAll(/<[a-z][^>]*\s(on[a-z]+)\s*=/gi)) bad.push(`inline handler ${m[1]}`);
  for (const m of html.matchAll(/(?:href|src|action)\s*=\s*["']\s*javascript:/gi)) bad.push('javascript: URL');
  return bad;
}

export const headersFile = () => `/*\n${Object.entries(SECURITY_HEADERS).map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n`;
