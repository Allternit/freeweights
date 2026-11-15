# Freeweights Community Upload Rules

Status: Draft. Owner: Allternit. Counsel review pending (see the end of this file). These rules apply to anyone who creates a repo or uploads files to freeweights.allternit.com. An account accepts them once, before its first upload.

## 1. What you may upload

- Models and datasets that you made, or that you have the right to share under their license.
- Fine-tunes, merges, quantized files and adapters of other models, when the base model's license allows it. Name the base model and keep its license and notices.
- Documentation, model cards and small support files that belong with the repo.

You stay the owner of what you upload. By uploading you tell us you have the right to share it under the license you chose.

## 2. What you may not upload

- Anything you do not have the right to share, or whose license forbids redistribution.
- Malware, files that run code on download, and executables or archives. Weights must be in a data format such as safetensors or GGUF. Pickle files are scanned and may be held.
- Secrets: API keys, passwords, tokens, private keys.
- Personal data about people who did not agree to it.
- Child sexual abuse material, non-consensual intimate imagery, and a real person's likeness or voice without their documented permission.
- Content that is meant to deceive, defraud or harm people, including material made to market crime.
- Anything that breaks the law where you live or where we operate.

## 3. Scanning

Every file is scanned before anyone can download it. A scan checks that the file matches the checksum you sent, checks weight files and pickles for unsafe content, looks for malware and secrets, and compares the file to our blocklists. Scans can take time. A file that is still scanning is not served.

A file that fails a scan is held, not served. The repo page shows the reason code to you. You can fix the file and upload again. Held files are deleted after 14 days. We do not promise that a scan finds everything, and a clean scan is not a statement that a file is safe to run.

## 4. Limits

Upload limits protect the service. The current limits are published at `/api/fw/v1/limits` and on the uploads guide. They can change, and a limit that is unset means uploads are paused.

## 5. Reporting

Anyone can report a repo. Write to one of these addresses and name the repo (`handle/name`):

| Address | Use |
| --- | --- |
| abuse@allternit.com | Banned content, policy reports |
| dmca@allternit.com | Copyright notices and counter-notices |
| security@allternit.com | Malware, secrets, vulnerabilities |
| freeweights@allternit.com | Everything else |

Each report gets an acknowledgement and a ticket number. We decide within 72 hours of receipt and tell the reporter. Malware and child sexual abuse material are handled at once.

## 6. What we may do

We may hold a file, disable a repo, remove a repo, or suspend an account when a scan fails, a report is upheld, a court or authority requires it, or these rules are broken. Nothing other than a scanner hit or a blocklist match is removed without a person looking at it. Repeat infringers lose their accounts.

A removed repo stops being served at once. On the cached pages and manifests it answers 404. On the API it answers 451 with code `removed_after_takedown`. The full procedure, with counter-notices and appeals, is in the takedown procedure. The owner may appeal in writing within 30 days.

## 7. No guarantees

We do not guarantee that a repo will be hosted, that a scan will pass, how long a scan takes, or that any file stays available. We may change these rules and the limits. Material changes are announced on this site.

## Verify with counsel

- The full text of sections 2, 3 and 6, and the terms-of-use wording that binds an uploader to them.
- Whether the license grant an uploader gives us to host and serve a file needs its own clause.
- The section 512 repeat-infringer policy wording.
- The retention period for held and removed files.
