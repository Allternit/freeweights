// Run by tests/test_studio_action.py. Prints a JSON list of failures (empty = pass).
// Regression: "Fine-tune in Studio" showed for any of 12 tasks, but Studio's trainers fine-tune only causal
// language models from safetensors bases (allternit-ai studio-jobs.ts isTrainableBase). GLM-5.3-Flash
// (image-text-to-text) got a button that lands on a model page with no fine-tune.
import { actionsFor } from '../site/lib/actions.mjs';
const base = { kind: 'model', manifest_url: 'm', redistribution: 'yes', formats: ['safetensors'], relation: { type: 'base' }, tasks: ['text-generation'] };
const fails = [];
const eq = (name, r, want) => { const got = Boolean(actionsFor(r).studio); if (got !== want) fails.push(`${name}: got ${got}, want ${want}`); };
eq('text-generation safetensors base', base, true);
eq('image-text-to-text', { ...base, tasks: ['image-text-to-text'] }, false);
eq('feature-extraction', { ...base, tasks: ['feature-extraction'] }, false);
eq('gguf repo', { ...base, formats: ['gguf'] }, false);
eq('mlx + safetensors', { ...base, formats: ['safetensors', 'mlx'] }, false);
eq('quant', { ...base, relation: { type: 'quant' } }, false);
eq('no redistribution', { ...base, redistribution: 'no' }, false);
eq('no manifest', { ...base, manifest_url: '' }, false);
eq('link only', { ...base, linkOnly: true }, false);
console.log(JSON.stringify(fails));
