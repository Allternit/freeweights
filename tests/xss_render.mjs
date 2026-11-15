// Reads JSON [{name, md}] on stdin, writes JSON [{name, html}] using the safe renderer. Used by test_markdown_xss.py.
import { mdSafe } from '../site/lib/markdown.mjs';
let buf = ''; for await (const c of process.stdin) buf += c;
const base = 'https://huggingface.co/acme/model/blob/abc1234/';
process.stdout.write(JSON.stringify(JSON.parse(buf).map((c) => ({ name: c.name, html: mdSafe(c.md, { base }) }))));
