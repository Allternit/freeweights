-- freeweights-accounts 0001: every account table, in one migration (contract spec/accounts-v1.md).
-- This is a separate D1 database (binding ACC). The catalog database (binding DB, worker/migrations/) holds
-- no personal data and never joins with this one.
--
-- Rules for every table here:
-- * No email address, no IP address, no user agent, no token or token hash is stored. Email and sessions
--   stay in Clerk; tokens are cloud-api alt_ keys.
-- * No download is logged per person. Download counts stay aggregate, in the catalog database.
-- * Times are ISO 8601 UTC text ('2026-11-15T12:00:00Z'). created_at has a default; the Worker sets
--   updated_at on every UPDATE.
-- * Ids are text. Users use the Clerk user id (user_...). Other rows use a Worker-generated ULID with a
--   short prefix (org_, grp_, rp_, up_, sc_, col_, ci_, dsc_, cm_, pst_, wh_, whd_, rpt_).
-- * "Owner" is two nullable columns (owner_user_id, owner_org_id) with a CHECK that exactly one is set, so
--   both keep a real foreign key.
-- * Handles (user handles and org slugs) share one namespace, case-insensitive, and may not take a
--   reserved handle. Triggers at the end of this file enforce it.
-- Additive and safe to run more than once.

-- ---- People and organizations ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,                                  -- Clerk user id (JWT sub)
  handle      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name        TEXT,                                              -- display name
  avatar_url  TEXT,
  bio         TEXT CHECK (bio IS NULL OR length(bio) <= 2000),
  homepage    TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (length(handle) BETWEEN 2 AND 42),
  CHECK (handle NOT GLOB '*[^A-Za-z0-9._-]*'),
  CHECK (substr(handle, 1, 1) GLOB '[A-Za-z0-9]'),
  CHECK (handle NOT LIKE '%..%' AND handle NOT LIKE '%--%')
);

CREATE TABLE IF NOT EXISTS orgs (
  id               TEXT PRIMARY KEY,                             -- org_<ulid>
  slug             TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name             TEXT,
  avatar_url       TEXT,
  description      TEXT CHECK (description IS NULL OR length(description) <= 2000),
  homepage         TEXT,
  clerk_org_id     TEXT UNIQUE,                                  -- set when the org is a Clerk organization
  verified         INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1)),
  verified_domain  TEXT,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (length(slug) BETWEEN 2 AND 42),
  CHECK (slug NOT GLOB '*[^A-Za-z0-9._-]*'),
  CHECK (substr(slug, 1, 1) GLOB '[A-Za-z0-9]'),
  CHECK (slug NOT LIKE '%..%' AND slug NOT LIKE '%--%'),
  CHECK (verified = 0 OR verified_domain IS NOT NULL)
);

-- Roles follow Hugging Face: read < contributor < write < admin.
CREATE TABLE IF NOT EXISTS org_members (
  org_id      TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'read' CHECK (role IN ('read', 'contributor', 'write', 'admin')),
  source      TEXT NOT NULL DEFAULT 'local' CHECK (source IN ('local', 'clerk')),  -- clerk = synced from the entitlement claim orgs[]
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (org_id, user_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS org_members_user ON org_members(user_id);

-- Resource groups inside an org (Team add-on). A group grants its role on the repos linked to it.
CREATE TABLE IF NOT EXISTS groups (
  id           TEXT PRIMARY KEY,                                 -- grp_<ulid>
  org_id       TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL COLLATE NOCASE CHECK (length(slug) BETWEEN 1 AND 64 AND slug NOT GLOB '*[^A-Za-z0-9._-]*'),
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (org_id, slug)
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id    TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'read' CHECK (role IN ('read', 'contributor', 'write', 'admin')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (group_id, user_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS group_members_user ON group_members(user_id);

-- Handles nobody may take: catalog publisher names, catalog section ids, site route words.
-- Seeded by 0002_reserved_handles.sql (generated by scripts/reserved_handles.py). A verified publisher
-- claims its name by an admin deleting the row and creating the org in the same batch.
CREATE TABLE IF NOT EXISTS reserved_handles (
  handle      TEXT PRIMARY KEY COLLATE NOCASE,
  reason      TEXT NOT NULL CHECK (reason IN ('catalog_org', 'section', 'route', 'brand')),
  source      TEXT,                                              -- e.g. the section id a short name came from
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
) WITHOUT ROWID;

-- ---- Repositories ---------------------------------------------------------------------------------

-- One row per repository the account features touch. source = 'community' for user uploads.
-- source = 'catalog' rows are created on first community action (like, discussion, collection item,
-- paper link) for a catalog entry, so every feature can use one foreign key; they have no owner and
-- their namespace is a reserved catalog org. The catalog itself stays in catalog/catalog.json.
CREATE TABLE IF NOT EXISTS repos (
  id             TEXT PRIMARY KEY,                               -- rp_<ulid>, stable across moves; used in token scope freeweights.repo:<id>
  kind           TEXT NOT NULL CHECK (kind IN ('model', 'dataset', 'app')),
  source         TEXT NOT NULL DEFAULT 'community' CHECK (source IN ('community', 'catalog')),
  namespace      TEXT NOT NULL COLLATE NOCASE,                   -- owner handle, kept in step with users.handle / orgs.slug
  name           TEXT NOT NULL COLLATE NOCASE,
  owner_user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  owner_org_id   TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  group_id       TEXT REFERENCES groups(id) ON DELETE SET NULL, -- org repos only: the resource group whose members get access
  private        INTEGER NOT NULL DEFAULT 0 CHECK (private IN (0, 1)),
  gated         TEXT NOT NULL DEFAULT 'off' CHECK (gated IN ('off', 'auto', 'manual')),
  discussions_disabled INTEGER NOT NULL DEFAULT 0 CHECK (discussions_disabled IN (0, 1)),
  base_repo      TEXT,                                           -- 'namespace/name' of the parent (catalog or community)
  relation       TEXT CHECK (relation IS NULL OR relation IN ('base', 'finetune', 'quant', 'adapter', 'merge')),
  license_id     TEXT,                                           -- SPDX id or policy/licenses.json key
  app_sdk        TEXT CHECK (app_sdk IS NULL OR app_sdk IN ('static', 'gradio', 'streamlit', 'docker', 'mcp')),
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scanning', 'live', 'held', 'removed')),
  head_commit    TEXT,                                           -- oid of main
  bytes          INTEGER NOT NULL DEFAULT 0 CHECK (bytes >= 0),  -- stored bytes at head
  likes          INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),  -- cached count of likes rows
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (kind, namespace, name),
  CHECK (length(name) BETWEEN 1 AND 96),
  CHECK (name NOT GLOB '*[^A-Za-z0-9._-]*'),
  CHECK (name NOT LIKE '%..%' AND name NOT LIKE '%--%' AND name NOT LIKE '%.git'),
  CHECK (
    (source = 'catalog' AND owner_user_id IS NULL AND owner_org_id IS NULL AND private = 0)
    OR (source = 'community' AND ((owner_user_id IS NULL) <> (owner_org_id IS NULL)))
  ),
  CHECK (app_sdk IS NULL OR kind = 'app'),
  CHECK (group_id IS NULL OR owner_org_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS repos_owner_user ON repos(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS repos_owner_org ON repos(owner_org_id) WHERE owner_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS repos_status ON repos(status, updated_at);
CREATE INDEX IF NOT EXISTS repos_base ON repos(base_repo) WHERE base_repo IS NOT NULL;

-- Commits. The file tree of each commit is a JSON object in R2 at tree_key (same shape as a manifest's
-- files list), so the database never holds per-file rows.
CREATE TABLE IF NOT EXISTS commits (
  oid             TEXT PRIMARY KEY CHECK (length(oid) = 40 AND oid NOT GLOB '*[^0-9a-f]*'),
  repo_id         TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  parent_oid      TEXT,                                          -- null for the first commit
  ref             TEXT NOT NULL DEFAULT 'refs/heads/main',       -- refs/heads/main or refs/pr/<num>
  author_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 500),
  message         TEXT,
  tree_key        TEXT NOT NULL,                                 -- R2 key of the commit's file list
  files_changed   INTEGER NOT NULL DEFAULT 0 CHECK (files_changed >= 0),
  bytes           INTEGER NOT NULL DEFAULT 0 CHECK (bytes >= 0), -- repo bytes after this commit
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS commits_repo ON commits(repo_id, ref, created_at);

-- In-flight uploads (LFS batch -> presigned R2 PUT or multipart -> verify -> commit).
-- New bytes land in the quarantine bucket; the scanner promotes them to the public or private bucket.
CREATE TABLE IF NOT EXISTS uploads (
  id              TEXT PRIMARY KEY,                              -- up_<ulid>
  repo_id         TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  oid             TEXT NOT NULL CHECK (length(oid) = 64 AND oid NOT GLOB '*[^0-9a-f]*'),  -- sha256
  size            INTEGER NOT NULL CHECK (size >= 0),
  transfer        TEXT NOT NULL CHECK (transfer IN ('basic', 'multipart')),
  bucket          TEXT NOT NULL DEFAULT 'quarantine' CHECK (bucket IN ('quarantine', 'public', 'private')),
  r2_key          TEXT NOT NULL,
  r2_upload_id    TEXT,                                          -- multipart only
  parts           INTEGER CHECK (parts IS NULL OR parts >= 1),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'verified', 'committed', 'aborted', 'expired')),
  expires_at      TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (transfer = 'basic' OR r2_upload_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS uploads_repo ON uploads(repo_id, status);
CREATE INDEX IF NOT EXISTS uploads_oid ON uploads(oid);
CREATE INDEX IF NOT EXISTS uploads_expiry ON uploads(status, expires_at);

-- One row per scanned file per commit (D12). A repo is live only when every scan of its head is clean.
CREATE TABLE IF NOT EXISTS scans (
  id               TEXT PRIMARY KEY,                             -- sc_<ulid>
  repo_id          TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  commit_oid       TEXT REFERENCES commits(oid) ON DELETE CASCADE,
  path             TEXT NOT NULL,
  sha256           TEXT NOT NULL CHECK (length(sha256) = 64 AND sha256 NOT GLOB '*[^0-9a-f]*'),
  file_class       TEXT NOT NULL CHECK (file_class IN ('weights', 'pickle', 'other')),
  status           TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'scanning', 'clean', 'held', 'error')),
  findings         TEXT,                                         -- JSON array of {scanner, code, detail}
  scanner_version  TEXT,
  started_at       TEXT,
  finished_at      TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS scans_repo ON scans(repo_id, commit_oid);
CREATE INDEX IF NOT EXISTS scans_queue ON scans(status, created_at);
CREATE INDEX IF NOT EXISTS scans_sha ON scans(sha256);

-- ---- Social -----------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS likes (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repo_id     TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (user_id, repo_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS likes_repo ON likes(repo_id, created_at);

CREATE TABLE IF NOT EXISTS follows (
  follower_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  followee_org_id   TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((followee_user_id IS NULL) <> (followee_org_id IS NULL)),
  CHECK (followee_user_id IS NULL OR followee_user_id <> follower_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS follows_user ON follows(follower_id, followee_user_id) WHERE followee_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS follows_org ON follows(follower_id, followee_org_id) WHERE followee_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS follows_followee_user ON follows(followee_user_id) WHERE followee_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS follows_followee_org ON follows(followee_org_id) WHERE followee_org_id IS NOT NULL;

-- Collections. The public slug is '<namespace>/<slug>-<id suffix>' like Hugging Face.
CREATE TABLE IF NOT EXISTS collections (
  id             TEXT PRIMARY KEY,                               -- col_<ulid>
  namespace      TEXT NOT NULL COLLATE NOCASE,
  slug           TEXT NOT NULL,                                  -- '<title-slug>-<id suffix>'
  owner_user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  owner_org_id   TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  title          TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 60),
  description    TEXT CHECK (description IS NULL OR length(description) <= 150),
  private        INTEGER NOT NULL DEFAULT 0 CHECK (private IN (0, 1)),
  theme          TEXT,
  position       INTEGER NOT NULL DEFAULT 0,
  upvotes        INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (namespace, slug),
  CHECK ((owner_user_id IS NULL) <> (owner_org_id IS NULL))
);
CREATE INDEX IF NOT EXISTS collections_owner_user ON collections(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS collections_owner_org ON collections(owner_org_id) WHERE owner_org_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS collection_items (
  id             TEXT PRIMARY KEY,                               -- ci_<ulid> (Hugging Face item_object_id)
  collection_id  TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  item_type      TEXT NOT NULL CHECK (item_type IN ('model', 'dataset', 'app', 'paper', 'collection')),
  repo_id        TEXT REFERENCES repos(id) ON DELETE CASCADE,
  paper_id       TEXT REFERENCES papers(id) ON DELETE CASCADE,
  ref_collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
  note           TEXT CHECK (note IS NULL OR length(note) <= 500),
  position       INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (
    (item_type IN ('model', 'dataset', 'app') AND repo_id IS NOT NULL AND paper_id IS NULL AND ref_collection_id IS NULL)
    OR (item_type = 'paper' AND paper_id IS NOT NULL AND repo_id IS NULL AND ref_collection_id IS NULL)
    OR (item_type = 'collection' AND ref_collection_id IS NOT NULL AND repo_id IS NULL AND paper_id IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS collection_items_col ON collection_items(collection_id, position);
CREATE INDEX IF NOT EXISTS collection_items_repo ON collection_items(repo_id) WHERE repo_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS collection_items_unique_repo ON collection_items(collection_id, repo_id) WHERE repo_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS collection_items_unique_paper ON collection_items(collection_id, paper_id) WHERE paper_id IS NOT NULL;

-- Discussions and pull requests, numbered per repo (Hugging Face shares one counter for both).
CREATE TABLE IF NOT EXISTS discussions (
  id              TEXT PRIMARY KEY,                              -- dsc_<ulid>
  repo_id         TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  num             INTEGER NOT NULL CHECK (num >= 1),
  type            TEXT NOT NULL CHECK (type IN ('discussion', 'pr')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'merged')),
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
  author_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,   -- null = deleted account
  pinned          INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  locked          INTEGER NOT NULL DEFAULT 0 CHECK (locked IN (0, 1)),
  pr_base_ref     TEXT,                                          -- refs/heads/main
  pr_head_commit  TEXT,                                          -- head oid of refs/pr/<num>
  merge_commit    TEXT,
  comments        INTEGER NOT NULL DEFAULT 0 CHECK (comments >= 0),  -- cached count
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (repo_id, num),
  CHECK (type = 'pr' OR status IN ('open', 'closed')),
  CHECK (type = 'pr' OR (pr_base_ref IS NULL AND pr_head_commit IS NULL AND merge_commit IS NULL)),
  CHECK (status <> 'merged' OR merge_commit IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS discussions_repo ON discussions(repo_id, status, updated_at);
CREATE INDEX IF NOT EXISTS discussions_author ON discussions(author_user_id) WHERE author_user_id IS NOT NULL;

-- Discussion events. kind follows Hugging Face event types.
CREATE TABLE IF NOT EXISTS comments (
  id              TEXT PRIMARY KEY,                              -- cm_<ulid>
  discussion_id   TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  kind            TEXT NOT NULL DEFAULT 'comment' CHECK (kind IN ('comment', 'status-change', 'commit', 'title-change')),
  body            TEXT CHECK (body IS NULL OR length(body) <= 65536),  -- markdown (comment), or JSON data for other kinds
  edited          INTEGER NOT NULL DEFAULT 0 CHECK (edited IN (0, 1)),
  hidden          INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  hidden_reason   TEXT CHECK (hidden_reason IS NULL OR hidden_reason IN ('spam', 'abuse', 'off-topic', 'outdated', 'resolved', 'author')),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (kind <> 'comment' OR body IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS comments_discussion ON comments(discussion_id, created_at);
CREATE INDEX IF NOT EXISTS comments_author ON comments(author_user_id) WHERE author_user_id IS NOT NULL;

-- Short posts (Allternit-only /api/fw/v1/posts). A post may be made as an org the author can write for.
CREATE TABLE IF NOT EXISTS posts (
  id              TEXT PRIMARY KEY,                              -- pst_<ulid>
  author_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  as_org_id       TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 10000),
  attachments     TEXT,                                          -- JSON array of {type: repo|paper|image, ref}
  hidden          INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS posts_author ON posts(author_user_id, created_at) WHERE author_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_org ON posts(as_org_id, created_at) WHERE as_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_recent ON posts(created_at) WHERE hidden = 0;

-- ---- Webhooks ---------------------------------------------------------------------------------------

-- The secret is sent back to the receiver in X-Webhook-Secret, so it is stored encrypted (AES-GCM with a
-- Worker secret), never in plain text.
CREATE TABLE IF NOT EXISTS webhooks (
  id             TEXT PRIMARY KEY,                               -- wh_<ulid>
  owner_user_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
  owner_org_id   TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  url            TEXT NOT NULL CHECK (url LIKE 'https://%' AND length(url) <= 2048),
  watched        TEXT NOT NULL,                                  -- JSON array of {type: user|org|model|dataset|app, name}
  domains        TEXT NOT NULL DEFAULT '["repo","discussion"]',  -- JSON array, subset of repo|discussion
  secret_enc     TEXT,
  disabled       INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1)),
  disabled_reason TEXT CHECK (disabled_reason IS NULL OR disabled_reason IN ('user', 'failures', 'admin')),
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((owner_user_id IS NULL) <> (owner_org_id IS NULL))
);
CREATE INDEX IF NOT EXISTS webhooks_owner_user ON webhooks(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS webhooks_owner_org ON webhooks(owner_org_id) WHERE owner_org_id IS NOT NULL;

-- Deliveries are kept 30 days (the Worker deletes older rows). The payload body is not stored; event and
-- target are enough to replay from current state.
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id               TEXT PRIMARY KEY,                             -- whd_<ulid>
  webhook_id       TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_action     TEXT NOT NULL CHECK (event_action IN ('create', 'update', 'delete', 'move')),
  event_scope      TEXT NOT NULL,                                -- e.g. repo, repo.content, repo.config, discussion, discussion.comment
  repo_id          TEXT REFERENCES repos(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ok', 'failed', 'dropped')),
  http_status      INTEGER,
  attempts         INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at  TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS webhook_deliveries_hook ON webhook_deliveries(webhook_id, created_at);
CREATE INDEX IF NOT EXISTS webhook_deliveries_queue ON webhook_deliveries(status, next_attempt_at);

-- ---- Usage, audit, reports --------------------------------------------------------------------------

-- Stored bytes per owner, kept by the Worker at commit, delete and scan time. Limits come from the
-- entitlement claim (perks, addon_bytes), never from this database.
CREATE TABLE IF NOT EXISTS storage_usage (
  owner_user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  owner_org_id     TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  public_bytes     INTEGER NOT NULL DEFAULT 0 CHECK (public_bytes >= 0),
  private_bytes    INTEGER NOT NULL DEFAULT 0 CHECK (private_bytes >= 0),
  quarantine_bytes INTEGER NOT NULL DEFAULT 0 CHECK (quarantine_bytes >= 0),
  repos            INTEGER NOT NULL DEFAULT 0 CHECK (repos >= 0),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK ((owner_user_id IS NULL) <> (owner_org_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS storage_usage_user ON storage_usage(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS storage_usage_org ON storage_usage(owner_org_id) WHERE owner_org_id IS NOT NULL;

-- Account actions (repo created, visibility changed, member added, token scope used for a write...).
-- No IP address and no user agent. Org rows feed the Team audit log and its export.
CREATE TABLE IF NOT EXISTS audit_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id         TEXT REFERENCES orgs(id) ON DELETE CASCADE,
  actor_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  action         TEXT NOT NULL,                                  -- dotted verb, e.g. repo.create, repo.settings, org.member.add
  target_type    TEXT CHECK (target_type IS NULL OR target_type IN ('user', 'org', 'group', 'repo', 'collection', 'discussion', 'webhook', 'post', 'paper')),
  target_id      TEXT,
  meta           TEXT,                                           -- JSON, never a secret
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS audit_log_org ON audit_log(org_id, created_at) WHERE org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_log_actor ON audit_log(actor_user_id, created_at) WHERE actor_user_id IS NOT NULL;

-- Content reports from signed-in users. Legal notices without an account keep going to the takedown
-- mailbox (docs/takedowns). reason_class matches the catalog takedowns table.
CREATE TABLE IF NOT EXISTS reports (
  id                TEXT PRIMARY KEY,                            -- rpt_<ulid>
  reporter_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  target_type       TEXT NOT NULL CHECK (target_type IN ('user', 'org', 'repo', 'discussion', 'comment', 'post', 'collection', 'paper')),
  target_id         TEXT NOT NULL,
  reason_class      TEXT NOT NULL CHECK (reason_class IN ('copyright', 'csam', 'real_person_likeness', 'crime_marketing', 'malware_or_secrets', 'license_violation', 'spam', 'abuse', 'other')),
  body              TEXT CHECK (body IS NULL OR length(body) <= 5000),
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'actioned', 'rejected')),
  resolution        TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS reports_queue ON reports(status, created_at);
CREATE INDEX IF NOT EXISTS reports_target ON reports(target_type, target_id);

-- ---- Papers -----------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS papers (
  id               TEXT PRIMARY KEY,                             -- arXiv id, e.g. 2401.01234 (no version suffix)
  title            TEXT NOT NULL,
  authors          TEXT NOT NULL DEFAULT '[]',                   -- JSON array of names as printed on the paper
  summary          TEXT,
  published_at     TEXT,
  source           TEXT NOT NULL DEFAULT 'arxiv' CHECK (source IN ('arxiv')),
  submitted_by     TEXT REFERENCES users(id) ON DELETE SET NULL,
  upvotes          INTEGER NOT NULL DEFAULT 0 CHECK (upvotes >= 0),  -- cached count of paper_votes
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (id NOT GLOB '*[^0-9.]*' AND id GLOB '[0-9][0-9][0-9][0-9].[0-9]*')
);
CREATE INDEX IF NOT EXISTS papers_published ON papers(published_at);

CREATE TABLE IF NOT EXISTS paper_links (
  paper_id    TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  repo_id     TEXT NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  source      TEXT NOT NULL DEFAULT 'card' CHECK (source IN ('card', 'user', 'catalog')),  -- card = arXiv id found in the repo card
  linked_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (paper_id, repo_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS paper_links_repo ON paper_links(repo_id);

CREATE TABLE IF NOT EXISTS paper_votes (
  paper_id    TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (paper_id, user_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS paper_votes_user ON paper_votes(user_id);

-- ---- One handle namespace ---------------------------------------------------------------------------
-- A user handle may not equal an org slug or a reserved handle, and the other way round (case-insensitive).

CREATE TRIGGER IF NOT EXISTS users_handle_insert BEFORE INSERT ON users
WHEN EXISTS (SELECT 1 FROM reserved_handles WHERE handle = NEW.handle COLLATE NOCASE)
  OR EXISTS (SELECT 1 FROM orgs WHERE slug = NEW.handle COLLATE NOCASE)
BEGIN SELECT RAISE(ABORT, 'handle_taken'); END;

CREATE TRIGGER IF NOT EXISTS users_handle_update BEFORE UPDATE OF handle ON users
WHEN NEW.handle <> OLD.handle COLLATE NOCASE AND (
  EXISTS (SELECT 1 FROM reserved_handles WHERE handle = NEW.handle COLLATE NOCASE)
  OR EXISTS (SELECT 1 FROM orgs WHERE slug = NEW.handle COLLATE NOCASE))
BEGIN SELECT RAISE(ABORT, 'handle_taken'); END;

CREATE TRIGGER IF NOT EXISTS orgs_slug_insert BEFORE INSERT ON orgs
WHEN EXISTS (SELECT 1 FROM reserved_handles WHERE handle = NEW.slug COLLATE NOCASE)
  OR EXISTS (SELECT 1 FROM users WHERE handle = NEW.slug COLLATE NOCASE)
BEGIN SELECT RAISE(ABORT, 'handle_taken'); END;

CREATE TRIGGER IF NOT EXISTS orgs_slug_update BEFORE UPDATE OF slug ON orgs
WHEN NEW.slug <> OLD.slug COLLATE NOCASE AND (
  EXISTS (SELECT 1 FROM reserved_handles WHERE handle = NEW.slug COLLATE NOCASE)
  OR EXISTS (SELECT 1 FROM users WHERE handle = NEW.slug COLLATE NOCASE))
BEGIN SELECT RAISE(ABORT, 'handle_taken'); END;

-- A community repo may not sit under a reserved namespace (catalog rows are the only ones allowed there).
CREATE TRIGGER IF NOT EXISTS repos_namespace_insert BEFORE INSERT ON repos
WHEN NEW.source = 'community' AND EXISTS (SELECT 1 FROM reserved_handles WHERE handle = NEW.namespace COLLATE NOCASE)
BEGIN SELECT RAISE(ABORT, 'namespace_reserved'); END;
