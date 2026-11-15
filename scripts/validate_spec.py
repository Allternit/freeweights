#!/usr/bin/env python3
"""Validate spec samples against the schemas, and lint spec/hub-api.yaml.
Uses jsonschema if installed, else a small built-in subset checker."""
import glob, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "spec")
load = lambda p: json.load(open(p, encoding="utf-8"))

def mini(inst, sch, root, path="$"):
    """Subset: $ref, const, enum, type, pattern, min/max, required, properties,
    additionalProperties false, items, minItems, uniqueItems, anyOf, oneOf, if/then/else."""
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
    if "if" in sch:
        if not mini(inst, sch["if"], root, path):
            if "then" in sch: errs += mini(inst, sch["then"], root, path)
        elif "else" in sch: errs += mini(inst, sch["else"], root, path)
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
# the real catalog: every row, the catalog file, the (kind, id) key, and the license table
CAT = os.path.join(ROOT, "catalog")
if os.path.exists(os.path.join(CAT, "catalog.json")):
    sys.path.insert(0, os.path.join(ROOT, "scripts"))
    import licenses
    cat = load(os.path.join(CAT, "catalog.json"))
    report("catalog/catalog.json", check(cat, cat_s))
    rows = [load(p) for p in sorted(glob.glob(os.path.join(CAT, "rows", "*.json")))]
    report(f"catalog/rows/*.json ({len(rows)} rows)", [f"{r.get('id')}: {e}" for r in rows for e in check(r, cat_s)])
    keys = [(r.get("kind"), r.get("id")) for r in cat.get("models", [])]
    report("catalog key (kind, id) is unique", sorted({f"duplicate {k}" for k in keys if keys.count(k) > 1}))
    want = {c: c for c in ("permissive", "custom", "non-commercial", "territory", "unreviewed")}
    e = []
    for r in cat.get("models", []):
        lc, v = r.get("license_class"), licenses.verdict(r.get("license_id"))
        hosted = bool(r.get("manifest_url"))
        # the one rule that must never break: a hosted row's license allows copies with no gate and no territory limit
        if hosted and (lc not in ("permissive", "custom") or v in licenses.LINK_ONLY):
            e.append(f"{r['id']}: hosted, but license {r.get('license_id')!r} is {v!r} (class {lc!r})"); continue
        # gated rows (Hugging Face's flag), inherited rows and rows nobody reviewed may carry any license id
        if lc in ("gated", "unreviewed") or (r.get("audit") or {}).get("method") == "inherited": continue
        if v == "queue":
            byname = licenses.name_verdict(r.get("license_id"))
            if not byname: e.append(f"{r['id']}: license {r.get('license_id')!r} is not in policy/licenses.json")
            elif byname[0] != lc: e.append(f"{r['id']}: license_class {lc!r} but the declared name says {byname[0]!r}")
        elif want.get(lc) != v and not (r.get("link_reason") == "not-reviewed" and not hosted):
            e.append(f"{r['id']}: license_class {lc!r} but the table says {v!r} for {r.get('license_id')!r}")
    report("catalog rows agree with policy/licenses.json (and no hosted row has a link-only license)", e)
    e = []
    for r in rows:
        mp = os.path.join(ROOT, "manifests", r["id"].replace("/", "__") + ".json")
        if not os.path.exists(mp): continue
        mr = load(mp).get("license", {}).get("redistribution"); want_r = licenses.redistribution(r.get("license_class"))
        if mr != want_r or (r.get("redistribution") not in (None, mr)):
            e.append(f"{r['id']}: class {r.get('license_class')!r} means {want_r!r}, row says {r.get('redistribution')!r}, signed manifest says {mr!r}")
    report("every row's license class and its signed manifest's redistribution agree", e)
    report("license table docs are generated from policy/licenses.json",
           [f"{os.path.relpath(p, ROOT)} is out of date: run scripts/licenses.py --write-docs" for p, ok in licenses.docs_status() if not ok])
# negative test: schema must reject a bad manifest
bad = {"schema_version": 0, "id": "nope"}
report("negative: bad manifest is rejected", [] if check(bad, man_s) else ["bad manifest was accepted"])
row = load(sorted(glob.glob(f"{SPEC}/samples/*.catalog-row.json"))[0])
nokind = {k: v for k, v in row.items() if k != "kind"}
report("negative: a row without kind is rejected", [] if check(nokind, cat_s) else ["row without kind was accepted"])
badrel = dict(row, relation={"type": "quant", "parent": None})
report("negative: a quant without a parent is rejected", [] if check(badrel, cat_s) else ["quant with no parent was accepted"])

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
        engine2 = "openapi-spec-validator"
        try: validate(doc, base_uri="file://" + api)
        except Exception as ex: e.append(f"openapi-spec-validator: {str(ex).splitlines()[0]}")
    except ImportError:
        engine2 = "yaml parse only"
    report(f"spec/hub-api.yaml ({engine2})", e)

    # Parts (plan D8): every spec/parts/*.yaml is a full OpenAPI 3.1 document listed in hub-api.yaml x-parts.
    def refs_ok(node, root, where, out):
        if isinstance(node, dict):
            r = node.get("$ref")
            if isinstance(r, str):
                if not r.startswith("#/"): out.append(f"{where}: external $ref {r} (parts must be self-contained)")
                else:
                    cur = root
                    for part in r[2:].split("/"):
                        part = part.replace("~1", "/").replace("~0", "~")
                        if not isinstance(cur, dict) or part not in cur: out.append(f"{where}: $ref {r} does not resolve"); break
                        cur = cur[part]
            for k, v in node.items(): refs_ok(v, root, where, out)
        elif isinstance(node, list):
            for v in node: refs_ok(v, root, where, out)
    listed = set(doc.get("x-parts") or [])
    found = {os.path.relpath(p, SPEC) for p in glob.glob(os.path.join(SPEC, "parts", "*.yaml"))}
    report("spec/hub-api.yaml x-parts lists exactly spec/parts/*.yaml",
           [f"{x} is in x-parts but missing" for x in sorted(listed - found)] + [f"{x} is not listed in x-parts" for x in sorted(found - listed)])
    owner = {pth: "hub-api.yaml" for pth in doc.get("paths", {})}
    op_ids = {op.get("operationId"): "hub-api.yaml" for item in doc.get("paths", {}).values() for op in item.values() if isinstance(op, dict) and op.get("operationId")}
    METHODS = ("get", "put", "post", "delete", "patch", "head", "options")
    norm = lambda pth: re.sub(r"\{[^}]+\}", "{}", pth)
    shapes = {norm(pth): pth for pth in owner}
    for rel in sorted(found):
        part = yaml.safe_load(open(os.path.join(SPEC, rel), encoding="utf-8"))
        e = []
        if not str(part.get("openapi", "")).startswith("3.1"): e.append("openapi must be 3.1.x")
        for k in ("info", "paths", "components"):
            if k not in part: e.append(f"missing {k}")
        for pth, item in (part.get("paths") or {}).items():
            if pth in owner: e.append(f"path {pth} is also defined in {owner[pth]}")
            elif norm(pth) in shapes: e.append(f"path {pth} has the same shape as {shapes[norm(pth)]}")
            owner[pth] = rel; shapes[norm(pth)] = pth
            params = set(re.findall(r"\{([^}]+)\}", pth))
            declared = set()
            for prm in item.get("parameters", []):
                prm = part["components"]["parameters"][prm["$ref"].split("/")[-1]] if "$ref" in prm else prm
                if prm.get("in") == "path": declared.add(prm["name"])
            for m in METHODS:
                op = item.get(m)
                if op is None: continue
                if not op.get("responses"): e.append(f"{m.upper()} {pth}: no responses")
                oid = op.get("operationId")
                if not oid: e.append(f"{m.upper()} {pth}: no operationId")
                elif oid in op_ids: e.append(f"{m.upper()} {pth}: operationId {oid} also used in {op_ids[oid]}")
                else: op_ids[oid] = rel
                mine = set(declared)
                for prm in op.get("parameters", []):
                    prm = part["components"]["parameters"][prm["$ref"].split("/")[-1]] if "$ref" in prm else prm
                    if prm.get("in") == "path": mine.add(prm["name"])
                if mine != params: e.append(f"{m.upper()} {pth}: path parameters {sorted(mine)} do not match the template {sorted(params)}")
        refs_ok(part, part, rel, e)
        if engine2 == "openapi-spec-validator":
            try: validate(part)
            except Exception as ex: e.append(f"openapi-spec-validator: {str(ex).splitlines()[0]}")
        report(f"spec/{rel} ({engine2}; refs, path params, operationIds, no duplicate paths)", e)
except ImportError:
    report("spec/hub-api.yaml (pyyaml missing; skipped)", [])
sys.exit(1 if fails else 0)
