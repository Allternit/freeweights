import type { CatalogRow } from './types';
import { CATALOG_JSON, CLOUD, HOSTED, LOGOS } from './data.generated';

export const CATALOG: { sections: unknown[]; models: CatalogRow[] } = JSON.parse(CATALOG_JSON);
export const ROWS = new Map(CATALOG.models.map((r) => [r.id, r]));

// ---- Model views ------------------------------------------------------------------------------
// m is undefined for link-only rows (non-commercial, territory-limited or gated at the source): no manifest, no files.
// The publisher's logo as the site serves it (Pages, same host), or null when there is none.
const SITE_ORIGIN = 'https://freeweights.allternit.com';
const publisherLogo = (id: string) => { const f = LOGOS[id.split('/')[0]]; return f ? `${SITE_ORIGIN}/assets/orgs/${encodeURIComponent(f)}` : null; };

// The pinned commit comes from the bundled HOSTED map, so search never reads a manifest.
export function summary(r: CatalogRow, downloads: number) {
  return {
    id: r.id, modelId: r.id, sha: HOSTED[r.id] ?? null,
    pipeline_tag: r.tasks[0], library_name: r.formats[0],
    tags: [...r.tasks, ...r.formats, `license:${r.license_id}`, r.section],
    downloads, lastModified: r.added_at, section: r.section, license: r.license_id, badges: r.badges,
    publisher_logo: publisherLogo(r.id),
    allternit: CLOUD[r.id] ?? null,
  };
}
