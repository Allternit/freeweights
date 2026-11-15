---
title: Operating Statement
nav_label: Operating Statement
summary: Who runs Freeweights, what we promise, what we never host, how decisions are made, how money works, and how to report a problem.
updated: 2026-11-14
sections:
  - {id: who-we-are, title: Who we are}
  - {id: mission, title: Mission}
  - {id: we-always, title: We always}
  - {id: we-never, title: We never}
  - {id: hosting-lines, title: What we host and never host}
  - {id: decisions, title: How decisions are made}
  - {id: money, title: How money works}
  - {id: nonprofit, title: The road to a nonprofit owner}
  - {id: report, title: Report a problem}
  - {id: takedowns, title: Takedowns, counter-notices and appeals}
  - {id: change-log, title: Change log}
---
Freeweights is run by Allternit, the open source alternative. This page is our Operating Statement: the promises we make and how we keep them. The promises will not change quietly. Every change goes in the log at the bottom.

## Who we are {#who-we-are}

Freeweights is a project of Allternit, an American company. Today the owner is Allternit LLC. We plan to hand the commons to a nonprofit steward. That nonprofit does not exist yet, and we do not name one until it does.

The code that runs Freeweights is open source: the hub, the site, the tools and the specs. It does not include the Allternit apps. The planned code license is Apache-2.0, confirmed before launch.

Contact: freeweights@allternit.com.

## Mission {#mission}

Freeweights keeps open AI models open. Anyone can find, check and download them for free, with no account. Allternit, an American company, runs it in the open. The code is open source and the costs are public. Freeweights is subsidized: supporters, sponsors, mirror hosts and a share of Allternit's revenue pay for it.

## We always {#we-always}

### Keep public models free to download
No paywall. No account. No email. You never log in to get a public model. In practice: the download route needs no token, the privacy notice says we count download starts and keep no list of people, and we do not sell ranking or access (see "We never"). How we enforce it: the read API is public by design and the spec says so. A request that carries a Hugging Face token is refused, so no one ties a download to an identity by accident.

### Publish the license and a checksum with every file
Every file in a manifest has its size and sha256. Every model shows its license id and the hash of the license text. In practice: you can check a download with stock tools. See Verify in the docs. How we enforce it: a hosted model is listed only with a manifest that passes the schema check and is signed. A custom license also shows a click-through before download. A model we link to without hosting says so, and why.

### Say where the bytes come from
Each hosted model shows "Hosted (signed)" and one of three badges: Hosted by Allternit (bytes on a Freeweights origin or registered mirror), Community seeded (at least one known seeder holds a full copy), or From source (we redirect to the publisher at a pinned commit, checked against the signed manifest). A model we do not host shows "From the publisher" and the reason: gated, non-commercial, territory-limited, or license not reviewed. In practice: the badge tells you who serves you. How we enforce it: a source is checked when it is read, with a time limit. A source that fails is shown as failed, and a model with no live source moves to Wanted.

### Publish the code that runs Freeweights
The hub, site, tools and specs live in a public repository under an open license. In practice: anyone can read how a manifest is checked and run their own copy. How we enforce it: we do not run private code in the download path.

### Publish what Freeweights costs and who pays
The ledger lists every cost and every payment received. In practice: see the Ledger page. How we enforce it: the ledger is a hash chain with a signed head, so a changed row is detectable by anyone. The first rows are real zeros: Stage 0 runs on free tiers.

### Apply support money first to the running costs
Support goes first to the costs in the ledger: hosting, bandwidth, storage, domain, signing and scanning. Each dollar is shown. In practice: money in appears in the ledger by type. How we enforce it: money out needs an invoice or receipt reference, and the verifier checks the chain. We do not say "100% goes to hosting", because that is a promise we cannot always keep.

### Welcome abliterated models
An abliterated model is a model with a refusal behavior removed. We list them. The card must say what was changed, from which base model, and by which method. In practice: abliterated models have their own section and a what-changed note. How we enforce it: a card without that note is not listed. A card that sells the model as a tool for a banned use is not listed either.

## We never {#we-never}

### List or host a model made for sexual content
Not now, not later. We judge a listing by how it is presented and what it is for. A general model that can be misused is allowed. A model named, tuned or marketed for sexual content is not. Allternit decides open cases on adult-themed text models. The draft default: allowed only if the card and marketing do not present sexual content as the purpose.

### List or host child sexual abuse material, or a model built to make it
We remove it, preserve the records the law requires, and report it. The exact steps come from counsel and are not yet final. Until then no one acts on them from memory.

### List or host a face or voice model of a real person without documented consent
"Of a real person" means one specific person. General speech models such as Kokoro stay allowed. The person's consent must be documented, and the document must be on file.

### List or host a model marketed for fraud, malware or attacks
We read the card, the name, the author's description and the training notes. If they point at a banned use, we do not list it. If intent is unclear, we ask the author. No answer in 7 days means we do not list it.

### Sell ranking, placement or access
Catalog order is never paid. Sponsors appear on the Mirrors page with a logo, capacity and since-date. That never changes the order of models. Support buys no badge, ranking, placement, access or early features.

### Show a model as available when it is not
Listed means downloadable. We check sources on read. If no source is live, the model moves to Wanted and the API answers 404. We do not show "coming soon" rows.

### Hide a takedown
Every removal is counted on a public page: reports received, items removed, items restored and the reason categories, per month. The page is on this site and updated with each removal.

## What we host and never host {#hosting-lines}

**Allowed.** All open model types: language, vision, speech, image, embedding and others. If Hugging Face lists a model, we list it. We host its files, with a checksum for every file, only when its license allows copies with no acceptance gate and no territory limit. Abliterated models, with the what-changed card. Data-only file formats: safetensors, GGUF, MLX and ONNX, and after a header check CoreML, CTranslate2, TFLite, OpenVINO and ggml. No pickle-only weights. General speech models, such as Kokoro, that do not copy one real person.

**Banned.** We never list or host:

1. A model made for sexual content. Not now, not later.
2. Child sexual abuse material, or a model built to make it.
3. A face or voice model of a real person without that person's documented consent.
4. A model marketed for fraud, malware or attacks.
5. Malware or secrets (keys, tokens, credentials) in any file or card.
6. Leaked weights, meaning weights the owner did not release.
7. Doxxing data, or datasets of private personal information.
8. Spam: listings made to sell, advertise or game search.

**The standard.** We judge a listing by how it is presented and what it is for, not only by what it can do. A general model that can be misused is allowed. A model that is named, tuned or marketed for a banned use is not.

**Licenses.** We host only licenses on the allow-list, or a custom license that passed a person's audit, a click-through, and a check that third parties may redistribute with no acceptance gate and no territory limit. Every other model Hugging Face lists is listed as a link only, "From the publisher", with the reason: gated, non-commercial, territory-limited, or license not reviewed. A model with no license at all is not listed. Gated repos are listed as a link only. We do not copy gated files and we do not bypass a gate. See Licenses in the docs.

## How decisions are made {#decisions}

Today Allternit's founder decides. There is no board and no vote. We say so because it is true.

- **Listing and removal.** Automatic quarantine happens in only two cases: a scanner hit, or a match to a hash on the blocklist. Nothing else is removed without a person looking at it.
- **Unclear cases in the first 90 days.** Draft default: Allternit rules, with counsel for anything that involves a real person. We confirm this before launch.
- **Reports.** We decide each report within 72 hours of receipt and tell the reporter. Malware and child sexual abuse material are handled at once.
- **Appeals.** The owner of a removed item may appeal in writing within 30 days. A person who did not make the first decision reviews it and answers in 14 days. Removals for child sexual abuse material are not appealed through this process.
- **Changes to this Operating Statement.** Changes go in the log below, with a date. A change that weakens a "We always" or "We never" line needs the nonprofit's board once one exists.

Several points still need counsel and a final decision: the wording of the real-person consent standard, the reporting steps for child sexual abuse material, the license list beyond v0, and whether this wording creates a promise we cannot keep at scale. They are marked as open until they are closed.

## How money works {#money}

Freeweights does not earn money. Public downloads are never sold. It is subsidized.

- **Stage 0 costs nothing.** It uses Cloudflare Pages, one Worker, a database and a small object store on free tiers, plus a public GitHub repository and free email routes. The ledger records these as zero-dollar rows.
- **Support is first applied to running costs.** Support goes to Allternit LLC, into a separate account used for Freeweights. It is not a charitable gift and is not tax-deductible.
- **The support link is not open yet.** It opens only after a separate bank account, the support terms page, the accountant's written view and a Minnesota charitable-solicitation check are done.
- **Sponsors and mirror hosts** give capacity. It is logged at the value they state, with their consent. It never changes catalog order.
- **Allternit's share.** A published share of Allternit revenue from running Freeweights models on Allternit's own cloud goes into the ledger. The draft is 5 percent of net revenue from those jobs. We set the final figure before launch.
- **Stages start on prepaid money.** A stage starts when three months are prepaid or pledged in writing. A step down is announced 30 days ahead.
- **Everything is public.** See the Ledger page.

## The road to a nonprofit owner {#nonprofit}

The aim is for a separate nonprofit to own the commons: the name, the repository organization, the ledger, the mirror data and the signing keys. Allternit would then be a vendor to the nonprofit at a fair price, under a conflict policy.

| When | Step |
| --- | --- |
| Now | Separate account, public ledger, prepaid hosting, "support" wording. |
| In parallel | We ask fiscal sponsors in writing whether they would host the project. No answer is claimed. |
| 3 to 12 months | A nonprofit owner with an independent board majority, a conflict policy and an independent treasurer. Counsel picks the legal form. |
| Long term | Allternit sells to the nonprofit at fair value. |

Until then Allternit LLC owns Freeweights. If a nonprofit takes over, we say how support money moves, and supporters may ask for a refund first.

## Report a problem {#report}

- **Banned content or a policy problem:** abuse@allternit.com.
- **Copyright:** a copyright notice or counter-notice (below) to dmca@allternit.com.
- **Malware, secrets or a security hole:** security@allternit.com.
- **Anything else, for example a wrong license, checksum or source:** freeweights@allternit.com, with the model id and what you found.

You get an acknowledgement and a ticket number. We decide within 72 hours.

## Takedowns, counter-notices and appeals {#takedowns}

**What counts as a takedown.** Any removal or disabling of a listing or file after a report, a scan, a blocklist match, a court order or a legal notice. Every one is counted.

**Copyright notice.** A notice must name the work, the infringing item, the sender's contact details, a good-faith statement and a statement of authority, with a signature. We remove or disable the item and tell the uploader and the source author.

**Counter-notice.** The owner may send a counter-notice. If it is complete, we restore the item in 10 to 14 business days unless the sender files a court action. Repeat infringers are removed from any contributor program.

**Appeal.** Written, within 30 days. A different person reviews it. Answer in 14 days.

**Blocklist.** Hashes and identifiers of removed items. They hold no content. A hash stays until an appeal or a court order removes it. The catalog build refuses any repo whose weight files match a hash. Hashes for non-sensitive removals (copyright, license, publisher request) are public in `policy/blocklist.json`. Hashes for sensitive removals (child sexual abuse material, non-consensual intimate imagery, personal data, a real person's likeness) are kept private and shared on request, and the public record for them shows only the date and reason class.

**What a removal does.** The item answers 451 at once on the API, the download redirect, the manifest and its page. Its weight hashes go on the blocklist, it leaves the catalog, the counter goes up, and a signed line (date, id, reason class, no personal data) is added to the registry chain. Details: the Takedowns doc page.

**Counter.** The public takedown counter sits at the end of this page (the site build fills it) and shows per month: reports received, items removed, items restored and reason categories. At launch it reads zero.

We plan to file a designated agent with the US Copyright Office. This is not done yet. Counsel confirms the filing and the fee first.

## Change log {#change-log}

| Date | Change |
| --- | --- |
| 2026-11-14 | If Hugging Face lists a model, we list it. Hosting still needs a license that allows copies with no acceptance gate and no territory limit; every other model is listed as a link only ("From the publisher") with the reason. A license that limits territory, or that no person has read yet, is no longer a reason to leave a model out. The We never lines are unchanged. |
| 2026-11-14 | First version. Mission and the We always / We never lines approved. Content policy, takedown process, license list, support terms, privacy notice and mirror agreement are drafts that await counsel. |
