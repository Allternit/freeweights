import { COLLECTIONS } from '../lib/paging.mjs';
import { catalogPages } from './catalog.mjs';

export function build() {
  COLLECTIONS.forEach((c) => catalogPages({ coll: c }));
}
