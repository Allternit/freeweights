import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(process.env.FW_ROOT || path.join(SITE, '..'));
export const OUT = path.resolve(process.env.FW_OUT || path.join(SITE, 'dist'));
// B5: model and tool detail pages, manifests and signatures go to a separate tree (default site/r2) that
// scripts/sync_r2.py uploads to the R2 bucket; they are served on the same URLs from R2, so Pages holds only
// fixed and paged files. FW_DETAILS=static writes them into dist as before (local preview, tests).
export const DETAILS_STATIC = process.env.FW_DETAILS === 'static';
export const OUT_R2 = DETAILS_STATIC ? OUT : path.resolve(process.env.FW_R2_OUT || path.join(SITE, 'r2'));
export const ORIGIN = 'https://freeweights.allternit.com';
export const KEY_ID = '2DC28CC7B26A283B';
