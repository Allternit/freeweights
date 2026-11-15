// Types for the Worker, which imports the pure Markdown core (worker/src/pages/repo.ts).
export function esc(s: unknown): string;
export function plain(s: string): string;
export function safeUrl(u: string, base?: string): string | null;
export interface MdOptions { safe?: boolean; keepH1?: boolean; base?: string; shift?: number; ids?: Set<string>; inl?: (s: string) => string }
export function md(src: string, opts?: MdOptions): { html: string; toc: { lv: number; id: string; text: string }[]; title: string | null };
