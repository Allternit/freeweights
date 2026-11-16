// POST /api/validate-yaml (Hugging Face compatible). huggingface_hub calls it before any commit that adds a
// README.md, with {"content": <README text>, "repoType": ...}, and reads {"errors": [...], "warnings": [...]}:
// a 400 with errors stops the upload, a 200 lets it go on. Without this route every `hf upload` of a model
// card failed with 405. Freeweights does not read card metadata at commit time, so this checks only the
// shape: a string up to 512 KiB, and a front matter block that is opened ("---" first line) is closed.
// Public: it stores nothing, reads no credential and touches no database.
import { json } from '../http';
import type { Handler } from '../router';

const MAX = 512 * 1024;
const bad = (message: string) => json({ errors: [{ message }], warnings: [] }, 400);

export const validateYamlRoute: Handler = async ({ req }) => {
  let body: unknown;
  try { body = await req.json(); } catch { return bad('The body must be JSON: {"content": "<README.md text>"}.'); }
  const content = (body as { content?: unknown } | null)?.content;
  if (typeof content !== 'string') return bad('content must be the README.md text.');
  if (content.length > MAX) return bad('README.md is larger than 512 KiB.');
  const lines = content.replace(/^﻿/, '').split(/\r?\n/);
  if (lines[0]?.trim() === '---' && !lines.slice(1).some((l) => l.trim() === '---')) {
    return bad('The metadata block that starts with "---" has no closing "---" line.');
  }
  return json({ errors: [], warnings: [] });
};
