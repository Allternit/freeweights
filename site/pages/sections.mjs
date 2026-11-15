import { SECTIONS } from '../lib/catalog.mjs';
import { catalogPages } from './catalog.mjs';

export function build() {
  SECTIONS.forEach((s) => catalogPages({ sec: s }));
}
