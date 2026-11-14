# MatrixHub audit (Phase 0.3)

Audited: `https://github.com/matrixhub-ai/matrixhub`, shallow clone of `main`.

- Pinned commit: `b2992e45d68b09a43a00bff3153eefcff6dc22ee` (2026-11-13, "docs: align website with CNCF sandbox guidance (#1126)")
- License: Apache License 2.0 (`LICENSE`, first line "Apache License, Version 2.0")
- Go version: `go 1.26.10` (`go.mod` line 3; CI uses `go-version-file: go.mod`)
- Web UI: `ui/` (Vite, TypeScript, TanStack-style routes under `ui/src/routes`)
- Upstream LFS and git engine: `github.com/matrixhub-ai/hfd` v0.0.0-20260522103102-73bc92d77d19 (`go.mod`), read from the local module cache. Several features below are implemented in that dependency, not in this repo.
- Default DB in shipped configs: sqlite (`deploy/config.yaml`). MySQL and PostgreSQL drivers are imported in `internal/infra/db/db.go:27-29`.

Status key: **shipped** = code path exists and is wired into the server; **partial** = code exists but is not fully wired, limited, or unverified end to end; **missing** = no code evidence at the pinned commit.

## Feature table

Roadmap column quotes `ROADMAP.md` at the pinned commit. Phase numbers are from that file.

| Feature | Roadmap says | Code evidence (pinned commit) | Status |
| --- | --- | --- | --- |
| HF API: whoami | P1 HF-compatible API | `internal/apiserver/handler/hf/handler.go:161` `/api/whoami-v2` | shipped |
| HF API: create, delete, move repo | P1 CRUD | `hf/handler.go:164-166` `/api/repos/create`, `/api/repos/delete`, `/api/repos/move` | shipped |
| HF API: list repos | P1 | `hf/handler.go:190` `/api/{models\|datasets\|spaces}` | shipped |
| HF API: model/dataset info | P1 | `hf/handler.go:189` `/api/{type}/{ns}/{repo}`, `:188` `/revision/{rev}` | shipped |
| HF API: tree, treesize | P1 | `hf/handler.go:186-187` `/treesize/{path}`, `/tree/{path}` | shipped |
| HF API: `/resolve` file download | P1 | `hf/handler.go:193-195`, `hf/handler_hf_download.go:174` `handleResolve` | shipped (serves bytes; see redirect row) |
| HF API: refs, commits, compare, branch, tag, settings | implied by P1 "HF-compatible" | `hf/handler.go:174-181` | shipped |
| HF API: preupload | P1 | `hf/handler.go:184`, `hf/handler_hf_upload.go:196` `handlePreupload` | shipped |
| HF API: commit (upload) | P1 "upload via HF_ENDPOINT" | `hf/handler.go:185`, `hf/handler_hf_upload.go:259` `handleCommit` | shipped |
| HF API: super-squash | not in roadmap | `hf/handler.go:181` | shipped (extra) |
| Git LFS batch API | P1 git access, LFS | `internal/apiserver/handler/lfs/handler.go:125-126` `/info/lfs/objects/batch`; LFS locks at `:133-140` | shipped |
| Git over HTTP (info/refs, upload-pack, receive-pack) | P1 "git over HTTP/SSH (clone, pull, tag, push)" | `internal/apiserver/handler/http/handler.go:139-144`, `handler_git.go` | shipped |
| Git over SSH (upload/receive pack, git-lfs-authenticate) | P1 "SSH" | `internal/apiserver/handler/ssh/server.go` (`executeReceivePackWithHooks`, `executeLFSAuthenticate`); `git-lfs-transfer` explicitly rejected at `server.go:336` | shipped for clone/push and LFS auth; `git-lfs-transfer` missing |
| SSH key management | P1 | `internal/domain/user/ssh_key_service.go`, `internal/apiserver/handler/current_user_handler.go` (CreateSSHKey/ListSSHKeys routes in `api/go/v1alpha1/current_user.pb.gw.go:407-447`) | shipped |
| Xet (large-file download) | P2 "XET support for large-file download" | Not used for downloads. `apiserver.go:301` `mirror.WithPushXET(true)`, `:302` `mirror.WithPullXET(false)`. Xet code lives in hfd (`pkg/lfs/remote.go`, `pkg/mirror/mirror.go`). Test env sets `HF_HUB_DISABLE_XET=1` (`test/...`, line 146). | partial (push side only; pull disabled; downloads go through LFS) |
| S3-compatible storage backend | P1 "S3-compatible backends"; P2 "S3-compatible backends support" | `internal/apiserver/apiserver.go:284-288` constructs only `gitstorage.NewStorage(WithRootDir)` and `lfs.NewLocal(storage.LFSDir())`. S3 exists in the dependency: `hfd/pkg/lfs/s3_storage.go` (with `SignGet` and `SignPut`), `hfd/pkg/s3fs/s3fs.go`. No S3 setting in `internal/infra/config/config.go`. | partial (code in dependency, not wired or configurable in MatrixHub) |
| NFS / local filesystem storage | P1 | `lfs.NewLocal` at `apiserver.go:288`; config `DataDir` at `apiserver.go:285` | shipped (local only; NFS is just a mounted local path, not separately tested here) |
| Redirect downloads (presigned URL) | implied by S3 + CDN goals (P3 "CDN-friendly download acceleration") | Redirect only when the storage implements `lfs.SignGetter` (`handler_hf_download.go:266-271`, `lfs/handler_git_lfs.go:105-108`). Local storage does not, so the server proxies bytes via `http.ServeContent` (`handler_hf_download.go:255-262`). | partial (redirect path exists, only reachable with S3 wired, which is not) |
| Proxy (pull-through) cache for public HF sources | P1 "Pull-once, serve-all proxy cache for public Hugging Face sources" | `internal/domain/syncjob/sync_job.go:64-66` `JobTypeModelCache` ("pulls a model of a proxy project from upstream"); `internal/apiserver/handler/model_handler.go` and `model_service.go` mention proxy; hfd has `pkg/mirror/tee_cache.go`. No `ProjectTypeProxy` in `internal/domain/project/project.go` (only Private and Public). | partial (cache job and tee cache exist; no proxy project type found) |
| Private and public projects | P1 "visibility controls" | `internal/domain/project/project.go:26-29` `ProjectTypePrivate`, `ProjectTypePublic` | shipped |
| Projects and CRUD | P1 | `internal/apiserver/handler/project_handler.go`; `project.go` (Name, Organization) | shipped |
| Org to path mapping | not stated | `project.go` has `Organization` field; HF routes use `{namespace}/{repo}` (`hf/handler.go:173-195`). Mapping of `Organization` to the namespace segment was not traced. | partial (unverified) |
| Users, roles, access keys | P1 "Users, roles, access keys, and robot accounts" | `internal/domain/user/access_token.go`, `api/go/v1alpha1/current_user.pb.gw.go:347-367` (access tokens), `internal/domain/role/role.go` (platform roles, member permissions) | shipped |
| HF token auth | P1 "hf CLI via HF_ENDPOINT" | `internal/apiserver/middleware/hf_authn.go` (`HFAuthnMiddleware` with access-token, session, robot repos) | shipped |
| Robot accounts and tokens | P1 | `internal/domain/robot/robot.go:30` `RobotPrefix = "robot$"`; `middleware/authenticator/robot_token.go`, `robot_basic.go`; robot routes in `api/go/v1alpha1/robot.pb.gw.go` | shipped |
| Token format rules (alt_, reject hf_) | not in this roadmap | Not checked against this repo. | not verified |
| Sessions and login | implied | `internal/apiserver/handler/login_handler.go`, `api/go/v1alpha1/login.pb.gw.go:98-118` `Login`, `Logout` | shipped |
| SSO / OIDC / LDAP | P3 "LDAP, OIDC, or SSO integration" | No matches in `internal/` or `cmd/` (the grep hits were the word "processor"). | missing |
| Public self-signup | not in roadmap (Non-goal: public community sharing) | No sign-up route. Users are created by an admin via `CreateUser` (`api/go/v1alpha1/user.pb.gw.go:294`) and `ui/src/routes` has `login.tsx` and `(auth)` only. | missing |
| Replication: pull and push sync policies | P1 "pull- and push-mode replication with manual or scheduled sync policies, including MatrixHub-to-MatrixHub" | `internal/domain/syncpolicy/sync_policy.go:33-34` `SyncPolicyTypePull`, `SyncPolicyTypePush`; `:64-66` `TriggerTypeManual`, `TriggerTypeScheduled`; `internal/domain/syncjob/sync_job_service.go`; `internal/domain/syncpolicy/generator.go:227-250`; API `sync_policy.pb.gw.go` | shipped (code); MatrixHub-to-MatrixHub target not traced |
| Resumable, chunked transfer and retry | P1 "Replication foundation with chunked transfer, resume, and retry" | Not traced in this repo; hfd `pkg/mirror` holds the transfer primitives | not verified |
| Visibility of in-progress transfers | P2 | `internal/jobserver/` (processor, logstore, canceller); `sync_job.go` | partial (job log and status exist; UI visibility not checked) |
| Presets and recommended models | P2 "Preset recommended models with Hugging Face mirror support" | `internal/domain/preset/preset_service.go`, `preset.go`; `internal/infra/config/config.go` `PresetsConfig` | shipped (preset list; HF mirror not checked) |
| Datasets | P3 | `internal/apiserver/handler/dataset_handler.go`; `api/go/v1alpha1/dataset.pb.gw.go` | shipped (earlier than P3) |
| Audit logging | P3 | No audit log code found (grep for "audit" in `internal/`, `cmd/`, `api/` returned nothing). | missing |
| RBAC, more granular permissions | P3 | `internal/domain/authz/authz.go`, `role.go` (permission constants such as `member.role_update`) | partial (RBAC exists; granularity not assessed) |
| Storage quotas | P3 | No quota code found. | missing |
| Cleanup policies | P3 "Cleanup policies" | `internal/domain/cleanup/cleanup.go`, `cleanup_service.go`, `internal/apiserver/handler/cleanup_handler.go`; `api/go/v1alpha1/cleanup.pb.gw.go` | shipped (preview, execute, stats) |
| Access statistics and trends | P3 | Only `StorageStats` in `internal/domain/cleanup/cleanup.go:35`; no usage-trend code found. | partial (storage stats only) |
| Security scanning of model content | P3 | No scanner code found. `internal/domain/model/metadata_analyzer.go` is metadata only. | missing |
| Model signing and verification | P3 | No signature code found (grep for cosign, minisign, signature: nothing). | missing |
| Tag locking and promotion | P3 "release management concepts" | Not found. Tags exist (`hf/handler.go:176-177`) but no lock. | missing |
| Dragonfly P2P pre-warm | P2 | No Dragonfly code (grep matched only the word "replicat" in files). | missing |
| ModelScope compatibility | Later | No code. | missing (roadmap says Later) |
| OCI artifact packaging | Later | No code. | missing (roadmap says Later) |
| Web UI (repos, admin) | P1 "Web UI for repository browsing and administration" | `ui/` (Vite + TypeScript); routes `ui/src/routes/` (login, auth, index, `$`) | shipped (the route list is short; the depth of admin screens was not audited) |
| Deploy: Docker Compose, Helm, Kubernetes | P1 | `deploy/docker/matrixhub`, `deploy/docker-compose*.yml`, `deploy/charts/matrixhub` | shipped |
| DB: sqlite default; MySQL, PostgreSQL | not stated | `deploy/config.yaml` (`driver: sqlite`); `internal/infra/db/db.go:27-29` | shipped |
| Non-goal: MLOps, training, public community sharing | Non-goals | Nothing in the code contradicts this. | n/a |

## Summary of what matters for Freeweights

- The HF-compatible read and write surface is the strongest part: list, info, tree, resolve, preupload and commit all exist (`internal/apiserver/handler/hf/handler.go:161-195`).
- Storage is local-only in this build. S3 is in the hfd dependency but MatrixHub does not construct it (`apiserver.go:284-288`), so there is no S3 backend, no presigned redirect, and no CDN path from this repo as shipped.
- Xet downloads are off on the pull side (`apiserver.go:302`).
- Signup, SSO, audit logs, quotas, signing, security scanning, tag locks, and quotas are missing.
- Replication code exists (pull and push sync policies), but the MatrixHub-to-MatrixHub path was not traced end to end.

## Not checked

- Runtime behavior. This is a code read at one commit, not a running test.
- Token prefix rules (`alt_` accepted, `hf_` rejected). Freeweights plan F13 depends on this, so it needs a run against the server.
- The hfd dependency was read only for the S3, Xet and signing functions named above.
