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

  // ---- Accounts (spec/accounts-v1.md). All optional: without them the Worker serves the public read API
  // only, and every write route answers 503 accounts_not_configured. ----
  /** D1 "freeweights-accounts" (worker/migrations-accounts/). Never joined with DB. */
  ACC?: D1Database;
  /** R2 "freeweights-private": private repo files. Served only through 5-minute presigned URLs. */
  PRIVATE?: R2Bucket;
  /** R2 "freeweights-quarantine": new uploads until the scanner clears them. */
  QUARANTINE?: R2Bucket;
  /** Comma list of accepted Clerk issuers, e.g. "https://clerk.allternit.com,https://allternit.com/__clerk". */
  CLERK_ISSUERS?: string;
  /** Clerk JWKS URL, cached 1 hour. */
  CLERK_JWKS_URL?: string;
  /** Comma list of accepted azp (authorized party) origins. */
  CLERK_AZP?: string;
  /** cloud-api GET /api/v1/freeweights/entitlement. */
  ENTITLEMENT_URL?: string;
  /**
   * Optional extra entitlement public keys, on top of the ones bundled from spec/keys/entitlement-v<n>.pub:
   * a comma list of "[kid=]<PEM or base64 SPKI>" (no kid = entitlement-v1). A public key, not a secret.
   */
  ENTITLEMENT_PUBKEY?: string;
  /** Secrets for presigning R2 S3-API URLs (R2 bindings cannot presign). Set with `wrangler secret put`. */
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  /** Secret: AES-GCM key (base64, 32 bytes) for webhooks.secret_enc. */
  WEBHOOK_SECRET_KEY?: string;
}

export interface ManifestFile { path: string; size: number; sha256: string; lfs: boolean }
export interface ManifestSource {
  type: 'hosted' | 'seeded' | 'source';
  url?: string; magnet?: string; priority: number; last_checked: string | null;
}
export interface Manifest {
  id: string; section: string; takedown?: boolean; created_at?: string;
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

// ---- Accounts contract (spec/accounts-v1.md) ------------------------------------------------------------

export type RepoKind = 'model' | 'dataset' | 'app';
/** URL segment Hugging Face clients send: /api/models, /api/datasets, /api/spaces (apps). /api/apps is our alias. */
export type RepoTypeSegment = 'models' | 'datasets' | 'spaces' | 'apps';
export type OrgRole = 'read' | 'contributor' | 'write' | 'admin';
export type FwScope = 'freeweights.read' | 'freeweights.write' | `freeweights.repo:${string}`;

/** Clerk session JWT claims the Worker reads (D1). Verified RS256 against the Clerk JWKS. */
export interface ClerkClaims {
  sub: string; iss: string; azp?: string; exp: number; nbf?: number; iat: number; sid?: string;
  org_id?: string; org_role?: string; org_slug?: string;
}

/**
 * Entitlement claim (D2): the payload of the EdDSA JWS cloud-api returns from GET /api/v1/freeweights/entitlement.
 * Header: {"alg":"EdDSA","typ":"JWT","kid":"entitlement-v1"}. Verified with spec/keys/entitlement-v1.pub.
 * Perk names and values come only from cloud-api; this repo never holds a perk value (D10).
 */
export interface EntitlementClaim {
  iss: string;              // "https://api.allternit.com"
  aud: 'freeweights';
  sub: string;              // Clerk user id
  plan: string;             // plan id as cloud-api names it, e.g. "free"
  orgs: EntitlementOrg[];
  /** Perk name -> value. Unknown names are ignored; a missing name means "not included". */
  perks: Record<string, number | boolean | string>;
  addon_bytes: { public: number; private: number };
  /** Scopes of the credential the claim was minted for. A Clerk session gets ["freeweights.read","freeweights.write"]. */
  scopes: FwScope[];
  /** "session" for a Clerk JWT, "key" for an alt_ key. */
  cred: 'session' | 'key';
  iat: number;
  exp: number;              // iat + 600
}
export interface EntitlementOrg {
  clerk_org_id: string; slug: string; role: 'admin' | 'member';
  plan: string; perks: Record<string, number | boolean | string>; addon_bytes: { public: number; private: number }; seats?: number;
}

/**
 * Who made the request. A Clerk session is known from its JWT alone (claim fetched only when a route needs a
 * plan or perk); an alt_ key is known only through its claim, so `claim` is always set for a key.
 */
export interface Caller { userId: string; cred: 'session' | 'key'; scopes: FwScope[]; claim?: EntitlementClaim; bearer: string }

// Rows of worker/migrations-accounts/0001_accounts.sql. Times are ISO 8601 UTC text; 0/1 are SQLite booleans.
type Bit = 0 | 1;
type Status3 = 'active' | 'suspended' | 'deleted';
export interface UserRow { id: string; handle: string; name: string | null; avatar_url: string | null; bio: string | null; homepage: string | null; status: Status3; created_at: string; updated_at: string }
export interface OrgRow { id: string; slug: string; name: string | null; avatar_url: string | null; description: string | null; homepage: string | null; clerk_org_id: string | null; verified: Bit; verified_domain: string | null; status: Status3; created_at: string; updated_at: string }
export interface OrgMemberRow { org_id: string; user_id: string; role: OrgRole; source: 'local' | 'clerk'; created_at: string; updated_at: string }
export interface GroupRow { id: string; org_id: string; slug: string; name: string; description: string | null; created_at: string; updated_at: string }
export interface GroupMemberRow { group_id: string; user_id: string; role: OrgRole; created_at: string; updated_at: string }
export interface ReservedHandleRow { handle: string; reason: 'catalog_org' | 'section' | 'route' | 'brand'; source: string | null; created_at: string }
export type RepoStatus = 'draft' | 'scanning' | 'live' | 'held' | 'removed';
export interface RepoRow {
  id: string; kind: RepoKind; source: 'community' | 'catalog'; namespace: string; name: string;
  owner_user_id: string | null; owner_org_id: string | null; group_id: string | null;
  private: Bit; gated: 'off' | 'auto' | 'manual'; discussions_disabled: Bit;
  base_repo: string | null; relation: 'base' | 'finetune' | 'quant' | 'adapter' | 'merge' | null;
  license_id: string | null; app_sdk: 'static' | 'gradio' | 'streamlit' | 'docker' | 'mcp' | null;
  status: RepoStatus; head_commit: string | null; bytes: number; likes: number; created_at: string; updated_at: string;
}
export interface CommitRow { oid: string; repo_id: string; parent_oid: string | null; ref: string; author_user_id: string | null; title: string; message: string | null; tree_key: string; files_changed: number; bytes: number; created_at: string }
export interface UploadRow {
  id: string; repo_id: string; user_id: string | null; oid: string; size: number; transfer: 'basic' | 'multipart';
  bucket: 'quarantine' | 'public' | 'private'; r2_key: string; r2_upload_id: string | null; parts: number | null;
  status: 'pending' | 'uploaded' | 'verified' | 'committed' | 'aborted' | 'expired'; expires_at: string; created_at: string; updated_at: string;
}
export interface ScanRow { id: string; repo_id: string; commit_oid: string | null; path: string; sha256: string; file_class: 'weights' | 'pickle' | 'other'; status: 'queued' | 'scanning' | 'clean' | 'held' | 'error'; findings: string | null; scanner_version: string | null; started_at: string | null; finished_at: string | null; created_at: string; updated_at: string }
export interface DiscussionRow {
  id: string; repo_id: string; num: number; type: 'discussion' | 'pr'; status: 'draft' | 'open' | 'closed' | 'merged';
  title: string; author_user_id: string | null; pinned: Bit; locked: Bit; pr_base_ref: string | null; pr_head_commit: string | null;
  merge_commit: string | null; comments: number; created_at: string; updated_at: string;
}
export interface CommentRow { id: string; discussion_id: string; author_user_id: string | null; kind: 'comment' | 'status-change' | 'commit' | 'title-change'; body: string | null; edited: Bit; hidden: Bit; hidden_reason: string | null; created_at: string; updated_at: string }
export interface CollectionRow { id: string; namespace: string; slug: string; owner_user_id: string | null; owner_org_id: string | null; title: string; description: string | null; private: Bit; theme: string | null; position: number; upvotes: number; created_at: string; updated_at: string }
export interface CollectionItemRow { id: string; collection_id: string; item_type: 'model' | 'dataset' | 'app' | 'paper' | 'collection'; repo_id: string | null; paper_id: string | null; ref_collection_id: string | null; note: string | null; position: number; created_at: string; updated_at: string }
export interface WebhookRow { id: string; owner_user_id: string | null; owner_org_id: string | null; url: string; watched: string; domains: string; secret_enc: string | null; disabled: Bit; disabled_reason: 'user' | 'failures' | 'admin' | null; created_at: string; updated_at: string }
export interface StorageUsageRow { owner_user_id: string | null; owner_org_id: string | null; public_bytes: number; private_bytes: number; quarantine_bytes: number; repos: number; updated_at: string }
export interface PaperRow { id: string; title: string; authors: string; summary: string | null; published_at: string | null; source: 'arxiv'; submitted_by: string | null; upvotes: number; created_at: string; updated_at: string }

/**
 * catalog/overlay/<name>.json (catalog/overlay/README.md): catalog id -> fields. Keys starting with "_" are
 * metadata (e.g. _meta: {source, generated_at}). Rows get the entry as r.overlay.<name>.
 */
export type CatalogOverlay = Record<string, Record<string, unknown>>;
