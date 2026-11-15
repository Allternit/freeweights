#!/usr/bin/env node
// Freeweights static site builder. Zero dependencies (Node 18+; model slots use top-level await).
// Reads the same data the Worker serves: catalog rows, manifests, the ledger CSVs and the
// mirror registry, plus the spec and policy files, and writes plain HTML into site/dist.
//   node site/build.mjs            (or: cd site && npm run build)
// FW_ROOT points at another repo root (used to test empty and error states); FW_OUT changes dist.
// Layout: lib/*.mjs are shared helpers, pages/*.mjs is one module per page family (each exports build()),
// pages/model/slots/ holds the model-page sections and assets/islands/ the client islands (see their READMEs).
import path from 'node:path';
import { OUT, OUT_R2, DETAILS_STATIC } from './lib/env.mjs';
import { ROOT } from './lib/env.mjs';
import { LISTED, WANTED, dataSource } from './lib/catalog.mjs';
import { DOCS } from './lib/markdown.mjs';
import { CHAIN, CHAIN_CHECK, HEAD_SIG } from './lib/chain.mjs';
import { SECTIONS } from './lib/catalog.mjs';
import { OLD_CHARTER, CHARTER_PATH } from './lib/markdown.mjs';
import { pages } from './lib/registry.mjs';
import { resetOut, emitPages, copyStatic, write } from './lib/assets.mjs';
import { headersFile } from './lib/csp.mjs';
import { writeSearchData } from './lib/search.mjs';
import { build as home } from './pages/home.mjs';
import { build as catalog } from './pages/catalog.mjs';
import { build as sections } from './pages/sections.mjs';
import { build as collections } from './pages/collections.mjs';
import { build as models } from './pages/model/index.mjs';
import { build as tools } from './pages/tools.mjs';
import { build as wanted } from './pages/wanted.mjs';
import { build as mirrors } from './pages/mirrors.mjs';
import { build as ledger } from './pages/ledger.mjs';
import { build as operatingStatement } from './pages/operating-statement.mjs';
import { build as docs } from './pages/docs.mjs';
import { build as design } from './pages/design.mjs';
import { build as studio } from './pages/studio.mjs';
import { build as notFound } from './pages/notfound.mjs';

// Page order matters: the code-block counter runs across pages in this order.
for (const build of [home, catalog, sections, collections, models, tools, wanted, mirrors, ledger, operatingStatement, docs, design, studio, notFound]) build();

// ---------- write ----------
resetOut();
const { detailBytes, detailCount, detailMax } = emitPages(pages);
copyStatic();
writeSearchData(write);
write('_headers', headersFile()); // CSP + nosniff + referrer-policy for every Pages response (the Worker adds the same to HTML it serves)
write('_redirects', [...['/alt.freeweights', ...SECTIONS.map((s) => s.id)].map((s) => `/${s} /${s}/ 301`), ...OLD_CHARTER.flatMap((o) => [`${o.slice(0, -1)} ${CHARTER_PATH} 301`, `${o} ${CHARTER_PATH} 301`])].join('\n') + '\n');
console.log(`Detail pages: ${detailCount} -> ${DETAILS_STATIC ? 'dist (FW_DETAILS=static)' : path.relative(process.cwd(), OUT_R2) || OUT_R2}, average ${(detailBytes / Math.max(1, detailCount) / 1024).toFixed(1)} KB, largest ${(detailMax / 1024).toFixed(1)} KB`);
console.log(`Freeweights site: ${pages.length} pages, ${LISTED.length} listed, ${WANTED.length} wanted, ${DOCS.length} docs, chain ${CHAIN.length} (${CHAIN_CHECK.bad ? 'BROKEN at ' + CHAIN_CHECK.bad : 'ok'}), head sig ${HEAD_SIG.state}, data from ${dataSource} -> ${path.relative(process.cwd(), OUT) || OUT}`);
