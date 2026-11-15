// Run by tests/test_fits_compute.py. Prints a JSON list of failures (empty = pass).
// Regression: device.json best_for "workstation" means "needs more than 12 GB" with no upper bound
// (scripts/build_device_overlay.mjs), so "Run at home" must come from the memory a build needs.
import { fitsCompute } from '../site/lib/actions.mjs';
const GB = 1e9;
const row = (quants) => ({ overlay: { device: { quants } } });
const fails = [];
const eq = (name, got, want) => { if (got !== want) fails.push(`${name}: got ${got}, want ${want}`); };
// GLM-5.3-Flash: smallest build 204 GB, every build tagged workstation.
eq('341 GB workstation build', fitsCompute(row([{ name: 'Q8_0', engine: 'llama.cpp', format: 'gguf', size: 341 * GB, best_for: ['workstation'] }, { name: '4bit', engine: 'mlx', format: 'mlx', size: 204 * GB, best_for: ['workstation'] }])), false);
// A 40 GB build needs 48.4 GB: fits a 96 GB box.
eq('40 GB build', fitsCompute(row([{ name: 'Q4_K_M', engine: 'llama.cpp', format: 'gguf', size: 40 * GB, best_for: ['workstation'] }])), true);
// 79.7 GB needs 96.04 GB: just over.
eq('79.7 GB build', fitsCompute(row([{ name: 'Q8_0', engine: 'llama.cpp', format: 'gguf', size: 79.7 * GB }])), false);
// ram_est wins when present.
eq('ram_est within', fitsCompute(row([{ name: 'x', engine: 'llama.cpp', format: 'gguf', size: 200 * GB, ram_est: 90 * GB }])), true);
// No device data: the manifest fallback still works.
eq('manifest gguf', fitsCompute({ manifest: { files: [{ path: 'a-Q4.gguf', size: 5 * GB }, { path: 'a-F16.gguf', size: 150 * GB }] } }), true);
console.log(JSON.stringify(fails));
