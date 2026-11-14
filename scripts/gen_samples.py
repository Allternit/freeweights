#!/usr/bin/env python3
"""One-off generator for spec/samples. Sizes and commits are real (HF API, 2026-11-14); sha256 values are placeholders = sha256('sample:'+path)."""
import hashlib, json, pathlib
out = pathlib.Path(__file__).resolve().parent.parent / "spec" / "samples"
h = lambda s: hashlib.sha256(("sample:" + s).encode()).hexdigest()
def canon(o): return json.dumps(o, sort_keys=True, indent=2, ensure_ascii=False) + "\n"
M = {
 "Qwen/Qwen3-Embedding-0.6B": dict(section="alt.freeweights.embed", commit="97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3", lic=("apache-2.0","Apache License 2.0","README.md"), name="Qwen3 Embedding 0.6B", tasks=["feature-extraction","embedding"], params=600000000, files=[(".gitattributes",1570,0),("README.md",17237,0),("config.json",727,0),("config_sentence_transformers.json",215,0),("generation_config.json",117,0),("merges.txt",1671853,0),("model.safetensors",1191586416,1),("modules.json",349,0),("tokenizer.json",11423705,1),("tokenizer_config.json",9706,0),("vocab.json",2776833,0)]),
}
rows = []
for id, m in M.items():
    org, repo = id.split("/")
    files = sorted(({"path": p, "size": s, "sha256": h(id + "/" + p), "lfs": bool(l)} for p, s, l in m["files"]), key=lambda f: f["path"])
    url = f"https://huggingface.co/{id}"
    man = {"schema_version": 0, "sample": True, "id": id, "section": m["section"],
      "upstream": {"host": "huggingface.co", "repo": id, "commit": m["commit"], "url": f"{url}/tree/{m['commit']}"},
      "license": {"id": m["lic"][0], "name": m["lic"][1], "file_path": m["lic"][2], "file_sha256": h(id + "/license"), "redistribution": "yes"},
      "files": files,
      "sources": [{"type": "source", "url": f"{url}/resolve/{m['commit']}/", "priority": 10, "last_checked": "2026-11-14T00:00:00Z"}],
      "created_at": "2026-11-14T00:00:00Z", "generator": "hand-written-sample"}
    (out / f"{org}__{repo}.manifest.json").write_text(canon(man))
    rows.append({"sample": True, "id": id, "display_name": m["name"], "section": m["section"], "family": m["section"].rsplit(".",1)[1], "tasks": m["tasks"], "license_id": m["lic"][0], "redistribution": "yes", "formats": ["safetensors"], "total_size": sum(f["size"] for f in files), "params": m["params"], "base_model": None, "abliterated": False, "what_changed": None, "badges": ["source"], "manifest_url": f"https://freeweights.allternit.com/manifests/{id}.json", "upstream_url": url, "added_at": "2026-11-14T00:00:00Z"})
for r in rows:
    org, repo = r["id"].split("/")
    (out / f"{org}__{repo}.catalog-row.json").write_text(canon(r))
