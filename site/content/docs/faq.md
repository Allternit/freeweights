---
title: FAQ
nav_label: FAQ
summary: Answers to common questions about Freeweights.
group: Help
order: 9
updated: 2026-11-14
sections:
  - {id: basics, title: The basics}
  - {id: downloading, title: Downloading and checking}
  - {id: content, title: Content and licenses}
  - {id: money, title: Money and ownership}
  - {id: helping, title: Helping}
---
## The basics {#basics}

### What is Freeweights?
A catalog of open AI models. Every file has a license and a checksum, every manifest is signed, and downloads are free with no account. Allternit runs it.

### Do you host the files?
It depends on the model, and the badge tells you. Hosted by Allternit means we or a registered mirror hold the bytes. Community seeded means a known seeder does. From source means we redirect you to the publisher at a pinned commit. At Stage 0 most models are From source.

### Why would I use this and not Hugging Face?
You can use both. Freeweights adds signed manifests with hashes, a license check before listing, a public ledger, and a record of where the bytes come from. If a publisher removes a model, the community can keep it available when the license allows.

### Who is behind it?
Allternit, an American company. The owner today is Allternit LLC. We plan to hand the commons to a nonprofit steward. None exists yet.

## Downloading and checking {#downloading}

### Do I need an account?
No. Not for any public model.

### Do you track me?
We count download starts per file and per day, not people. We do not store IP addresses with download records. We may hold an IP briefly in abuse logs, which we delete within 7 days unless an abuse case is open. No ads, no third-party trackers.

### Can I use my Hugging Face tools?
Yes. Set `HF_ENDPOINT=https://freeweights.allternit.com`. Do not send a Hugging Face token. See HF_ENDPOINT.

### Why was my token rejected?
A request with an `hf_` token is refused on purpose, so a credential never reaches us. We do not store or log it. Unset it.

### How do I check a download?
Verify the manifest signature with minisign, then compare each file's sha256. `fw.py verify` does both. See Verify.

### What if a hash does not match?
Discard the file and try the next source. If none match, email us with the model id.

### Why does the API say 404 model_wanted?
The model has no live source. It is on the Wanted page.

### Why 451?
The item was removed after a takedown. Every route for it answers 451 `removed_after_takedown`. It is counted on the Operating Statement page and recorded in the signed registry chain. See the Takedowns doc page.

### What is a download start?
A request to a resolve route that we redirect. We cannot see whether you finished, so we count starts.

## Content and licenses {#content}

### Which licenses are allowed?
MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, CC-BY-4.0 and CC0-1.0. Custom licenses pass only after a person's audit, with a click-through. See Licenses.

### Do you host abliterated models?
Yes, with a card that says what was changed, from which base model and by which method.

### What do you never host?
Models made for sexual content. Child sexual abuse material or a model built for it. Face or voice models of a real person without documented consent. Models marketed for fraud, malware or attacks. Malware or secrets. Leaked weights. Doxxing data. Spam.

### Why was a model refused?
See the Wanted page. Each refusal has a reason.

### Why is a model "From the publisher"?
If Hugging Face lists a model, we list it, but we host its files only when the license allows copies with no acceptance gate and no territory limit. Otherwise the entry links to the publisher's page and says why: gated (accept the license there first), non-commercial, territory-limited, or license not reviewed. Entries we host say "Hosted (signed)".

### Can I use a model commercially?
It depends on the license. The model page shows it. Read it before you build on it. We do not give legal advice.

### Do you scan files?
We check formats and headers: safetensors, GGUF, MLX and ONNX, and CoreML, CTranslate2, TFLite, OpenVINO and ggml after a header check that reads the first bytes of a file. Pickle-only weights are refused. Malware scanning and a hash blocklist come with the hub. Auto-quarantine happens only for a scanner hit or a blocklist match.

## Money and ownership {#money}

### How is it paid for?
By supporters, sponsors, mirror hosts and a share of Allternit's revenue. Stage 0 costs nothing, because it uses free tiers. See the Ledger.

### Can I support it?
Not yet. The support link opens after a separate bank account, the support terms, an accountant's written view and a Minnesota charitable-solicitation check. When it opens: support goes to Allternit LLC. It is not a charitable gift and is not tax-deductible.

### Do supporters get anything?
No badge, ranking, placement, access or early features. Supporters are named only with consent.

### Can money buy a place in the catalog?
No. Catalog order is never paid.

### How do I know the ledger is real?
It is a hash chain with a signed head. Run `python3 scripts/verify_ledger.py`. See the ledger chain doc. It proves the history was not edited. It does not prove each row is true, which is why money out needs a receipt reference.

## Helping {#helping}

### How do I run a mirror?
See Mirrors. Read the agreement and the license list, then email us.

### How do I request a model?
Open a GitHub issue at https://github.com/Allternit/freeweights/issues, or email freeweights@allternit.com.

### How do I report a problem?
Copyright notices go to dmca@allternit.com. Everything else goes to freeweights@allternit.com. Role addresses for abuse and security reports are set up before launch. We decide within 72 hours.
