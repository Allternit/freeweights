# Freeweights mirrors

A mirror is a host that stores and seeds Freeweights model and dataset bytes. Mirrors carry the bytes; the coordinator owns the rules and the registry (plan decision F1).

## Registry

`registry.json` lists every active mirror. Each entry has these fields:

| Field | Meaning |
|---|---|
| id | Stable short identifier |
| host_name | Name of the hosting party |
| url | Public URL of the mirror |
| region | Where the capacity sits |
| capacity_tb | Capacity offered, in TB |
| since | Start date, YYYY-MM-DD |
| contact | Contact for the mirror operator |
| logo_url | Logo shown on the mirror list, or null |
| sync_method | How the bytes are kept in sync (for example, `rsync`, `torrent`, `web-seed`) |
| models_served | List of model or dataset ids the mirror serves |

Sponsors appear here with logo, capacity and since-date. Sponsorship never changes catalog order.

## How to become a mirror

1. Read `policy/mirror-agreement.md` and `policy/license-allowlist.md`.
2. Confirm your host can meet the capacity and sync method you list.
3. Send a mirror request to the coordinator. Signed agreement comes first.
4. After the agreement is signed, the coordinator adds your entry to `registry.json` in a pull request.

Mirrors that hold bytes must keep the license and takedown terms in `policy/takedown.md`.

## Partners

`partners.json` lists candidate torrent projects for outreach. Status `candidate` means not yet contacted. An entry becomes a partner only after a signed agreement and an entry in `registry.json`.
