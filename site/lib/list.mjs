import { esc, fmtBytes } from './util.mjs';
import { logoOf, modelUrl } from './catalog.mjs';
import { FWC, monoUse } from './faces.mjs';
import { howTag } from './rows.mjs';
import { LOGO_OWNER, cardRow } from './cards.mjs';
import { lcTag, sampleTag } from './layout.mjs';

export function listRow(r, first) {
  // RECORD face as one newsreader line: From and group under the subject, then size, params, license, date.
  const lg = r.kind === 'tool' ? LOGO_OWNER(r) : logoOf(r.org);
  return `<a class="msg" href="${modelUrl(r)}" data-id="${esc(r.id)}"${first ? ' data-sel' : ''}><span class="s">${lg ? `<img class="org msg-org" src="${lg}" alt="" width="22" height="22" loading="lazy" decoding="async">` : `<span class="msg-org msg-mono">${monoUse(r.mono)}</span>`}<span class="s-t"><span class="s-n">${esc(r.name)}${r.sample ? sampleTag() : ''}</span><small>${r.kind === 'tool' ? '' : howTag(r) + ' '}<b>From:</b> ${esc(r.org)} <b>in</b> ${esc(r.section)}</small></span></span><span class="z mono">${r.kind === 'tool' ? esc(r.tag || 'no release') : fmtBytes(r.size)}</span><span class="pp mono">${r.params ? FWC.params(r.params) : '—'}</span><span class="lcc">${lcTag(r)}</span><span class="dt mono">${r.added ? String(r.added).slice(0, 10) : ''}</span></a>`;
}
export function preview(r) {
  const c = cardRow(r);
  return FWC.combined(c, { cls: 'fwk-pv', open: true });
}
