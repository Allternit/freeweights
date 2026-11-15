import { esc } from '../../lib/util.mjs';
import { LINK_REASON, LISTED, minisig } from '../../lib/catalog.mjs';
import { ICON } from '../../lib/faces.mjs';
import { PUBLISHER_LINE } from '../../lib/layout.mjs';

// Values several slots share. Built once per model; slots read what they need.
export function modelContext(r) {
  const m = r.manifest || {}; const files = m.files || []; const srcs = (m.sources || []).slice().sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  const commit = (m.upstream && m.upstream.commit) || ''; const treeUrl = (m.upstream && m.upstream.url) || r.upstream;
  const mf = `${r.id}.json`; const signed = !!minisig[r.id]; const licLink = r.licenseUrl || r.upstream; const lic = m.license || {};
  const why = LINK_REASON[r.linkReason || 'not-reviewed'];
  const ncNote = `<div class="notice" role="note">${ICON.info}<div><b>${esc(why[1])}</b> ${esc(why[2])} ${esc(PUBLISHER_LINE)} ${esc(r.note || '')}</div></div>`;
  const related = LISTED.filter((x) => x.section === r.section && x.id !== r.id).slice(0, 6);
  const rel = related.length >= 2 ? related : [...related, ...LISTED.filter((x) => x.id !== r.id && !related.includes(x) && r.tasks[0] && x.tasks[0] === r.tasks[0])].slice(0, 6);
  return { m, files, srcs, commit, treeUrl, mf, signed, licLink, lic, ncNote, rel };
}
