#!/usr/bin/env python3
"""Validate spec samples against the schemas, and lint spec/hub-api.yaml.
Uses jsonschema if installed, else a small built-in subset checker."""
import glob, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "spec")
load = lambda p: json.load(open(p, encoding="utf-8"))

def mini(inst, sch, root, path="$"):
    """Subset: $ref, const, enum, type, pattern, min/max, required, properties,
    additionalProperties false, items, minItems, uniqueItems, anyOf, oneOf, if/then."""
    errs = []
    if "$ref" in sch:
        node = root
        for part in sch["$ref"][2:].split("/"): node = node[part]
        return mini(inst, node, root, path)
    if "const" in sch and inst != sch["const"]: errs.append(f"{path}: expected {sch['const']!r}")
    if "enum" in sch and inst not in sch["enum"]: errs.append(f"{path}: {inst!r} not in enum")
    if "type" in sch:
        tm = {"string": str, "integer": int, "boolean": bool, "object": dict, "array": list, "null": type(None), "number": (int, float)}
        ts = sch["type"] if isinstance(sch["type"], list) else [sch["type"]]
        if not any(isinstance(inst, tm[t]) and not (t in ("integer", "number") and isinstance(inst, bool)) for t in ts):
            return errs + [f"{path}: wrong type, want {ts}"]
    if isinstance(inst, str):
        if "pattern" in sch and not re.search(sch["pattern"], inst): errs.append(f"{path}: {inst!r} fails pattern")
        if len(inst) < sch.get("minLength", 0): errs.append(f"{path}: too short")
    if isinstance(inst, int) and not isinstance(inst, bool) and inst < sch.get("minimum", inst): errs.append(f"{path}: below minimum")
    if isinstance(inst, dict):
        for r in sch.get("required", []):
            if r not in inst: errs.append(f"{path}: missing {r}")
        props = sch.get("properties", {})
        for k, v in inst.items():
            if k in props: errs += mini(v, props[k], root, f"{path}.{k}")
            elif sch.get("additionalProperties") is False: errs.append(f"{path}: unexpected key {k}")
    if isinstance(inst, list):
        if len(inst) < sch.get("minItems", 0): errs.append(f"{path}: too few items")
        if sch.get("uniqueItems") and len({json.dumps(i, sort_keys=True) for i in inst}) != len(inst): errs.append(f"{path}: duplicates")
        if "items" in sch:
            for i, v in enumerate(inst): errs += mini(v, sch["items"], root, f"{path}[{i}]")
    if "anyOf" in sch and not any(not mini(inst, s, root, path) for s in sch["anyOf"]): errs.append(f"{path}: fails anyOf")
    if "oneOf" in sch and sum(not mini(inst, s, root, path) for s in sch["oneOf"]) != 1: errs.append(f"{path}: must match exactly one of oneOf")
    if "if" in sch and not mini(inst, sch["if"], root, path) and "then" in sch: errs += mini(inst, sch["then"], root, path)
    return errs

try:
    import jsonschema
    def check(inst, sch):
        v = jsonschema.Draft202012Validator(sch)
        return [f"{'/'.join(map(str, e.absolute_path))}: {e.message}" for e in v.iter_errors(inst)]
    engine = "jsonschema"
except ImportError:
    check = lambda inst, sch: mini(inst, sch, sch)
    engine = "built-in"

def canonical(path):
    raw = open(path, encoding="utf-8").read()
    return raw == json.dumps(json.loads(raw), sort_keys=True, indent=2, ensure_ascii=False) + "\n" and not re.search(r"[ \t]+\n", raw)

fails = 0
def report(name, errs):
    global fails
    print(("FAIL " if errs else "ok   ") + name)
    for e in errs: print("     " + e)
    fails += bool(errs)

man_s, cat_s = load(f"{SPEC}/manifest-v0.schema.json"), load(f"{SPEC}/catalog-schema.json")
print(f"engine: {engine}")
for p in sorted(glob.glob(f"{SPEC}/samples/*.manifest.json")):
    e = check(load(p), man_s)
    if not canonical(p): e.append("not canonical JSON")
    report(os.path.relpath(p, ROOT), e)
for p in sorted(glob.glob(f"{SPEC}/samples/*.catalog-row.json")):
    report(os.path.relpath(p, ROOT), check(load(p), cat_s))
# negative test: schema must reject a bad manifest
bad = {"schema_version": 0, "id": "nope"}
report("negative: bad manifest is rejected", [] if check(bad, man_s) else ["bad manifest was accepted"])

api = os.path.join(SPEC, "hub-api.yaml")
try:
    import yaml
    doc = yaml.safe_load(open(api, encoding="utf-8"))
    e = []
    if not str(doc.get("openapi", "")).startswith("3.1"): e.append("openapi must be 3.1.x")
    for k in ("info", "paths", "components"):
        if k not in doc: e.append(f"missing {k}")
    for p in ("/api/models", "/api/models/{org}/{repo}", "/api/models/{org}/{repo}/tree/{rev}", "/{org}/{repo}/resolve/{rev}/{path}", "/api/catalog", "/manifests/{org}/{repo}.json", "/manifests/{org}/{repo}.json.minisig"):
        if p not in doc.get("paths", {}): e.append(f"missing path {p}")
    try:
        from openapi_spec_validator import validate
        validate(doc); engine2 = "openapi-spec-validator"
    except ImportError:
        engine2 = "yaml parse only"
    report(f"spec/hub-api.yaml ({engine2})", e)
except ImportError:
    report("spec/hub-api.yaml (pyyaml missing; skipped)", [])
sys.exit(1 if fails else 0)
