export interface Env {
  DB: D1Database;
  /** R2 bucket "freeweights": manifests, signatures and model detail pages. */
  FW: R2Bucket;
  /** Pass-through origin for paths the Worker does not own (preview only; production fetches the request as is). */
  PAGES_ORIGIN?: string;
  FRESH_MS?: string;
  CHECK_MODE?: string;
  HF_CHECK_CAP?: string;
  ORIGIN_BUDGET_BYTES?: string;
  PAID_ORIGIN_HOSTS?: string;
  /** "1" in production: paths the Worker does not own pass through to the Pages origin. */
  PASSTHROUGH?: string;
}

export interface ManifestFile { path: string; size: number; sha256: string; lfs: boolean }
export interface ManifestSource {
  type: 'hosted' | 'seeded' | 'source';
  url?: string; magnet?: string; priority: number; last_checked: string | null;
}
export interface Manifest {
  id: string; section: string; takedown?: boolean;
  upstream: { host: string; repo: string; commit: string; url: string };
  license: { id: string };
  files: ManifestFile[]; sources: ManifestSource[];
}
export interface CatalogRow {
  id: string; display_name: string; section: string; family: string; tasks: string[];
  license_id: string; formats: string[]; total_size: number; badges: string[];
  manifest_url: string; upstream_url: string; added_at: string;
  [k: string]: unknown;
}
export type State = 'live' | 'stale' | 'failed' | 'skipped';
