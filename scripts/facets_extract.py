#!/usr/bin/env python3
"""Derive per-row facet values for the catalog filters -> catalog/overlay/facets.json.

  python3 scripts/facets_extract.py [--offline] [--cache PATH] [--workers 4] [--limit N]

Output: { "<model id>": { "params_bin": "6-9", "libraries": [...], "languages": [...], "apps": [...] } }
(keys that start with "_" are metadata). Overlays add display data only; they never change a manifest.

Sources, in order of trust:
  1. catalog rows and manifests (params, formats, tasks, file names): always read.
  2. the Hugging Face model API at the commit each manifest pins (tags, library_name): no token,
     polite (4 workers, 0.15 s pause, waits out the anonymous 500-per-5-minutes quota: about 90 minutes for the whole catalog), resumable through an append-only JSONL
     cache. Only these two fields are kept. --offline skips it and uses local data alone.
  3. a parameter count missing from the catalog is read from the model name ("-7B-", "270M") only
     when the name has exactly one unambiguous size; rows with MoE names (8x7B, A3B) keep their
     catalog value or stay unstated.

Nothing here reads a token or touches a private repo; every id is a public catalog id."""
import argparse, concurrent.futures as cf, glob, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "freeweights-facets/0.1 (+https://freeweights.allternit.com)"}

# ---- parameter bins (Hugging Face's /models size filter) -------------------------------------
# code, label, lower bound inclusive (upper bound is the next one's lower bound, exclusive)
BINS = [("lt1", "<1B", 0), ("1-3", "1B to 3B", 1e9), ("3-6", "3B to 6B", 3e9), ("6-9", "6B to 9B", 6e9),
        ("9-12", "9B to 12B", 9e9), ("12-24", "12B to 24B", 12e9), ("24-32", "24B to 32B", 24e9),
        ("32-64", "32B to 64B", 32e9), ("64-128", "64B to 128B", 64e9), ("128-500", "128B to 500B", 128e9),
        ("gt500", ">500B", 500e9)]


def params_bin(n):
    """'' when unknown (None, 0, negative, NaN, non-number); otherwise the bin code. 6.0e9 is 6-9."""
    if isinstance(n, bool) or not isinstance(n, (int, float)) or n != n or n <= 0:
        return ""
    code = BINS[0][0]
    for c, _, lo in BINS:
        if n >= lo:
            code = c
    return code


_NAME = re.compile(r"(?<![A-Za-z0-9.])(\d+(?:\.\d+)?)([BbMm])(?![A-Za-z0-9])")
_MOE = re.compile(r"\d+x\d+(?:\.\d+)?[bBmM]|(?<![A-Za-z0-9])[Aa]\d+(?:\.\d+)?[bBmM](?![A-Za-z0-9])")


def params_from_name(name):
    """Parameter count from a model name, or None. Exactly one size token, no MoE shape."""
    base = name.split("/")[-1]
    if _MOE.search(base):
        return None
    hits = _NAME.findall(base)
    if len(hits) != 1:
        return None
    v, u = hits[0]
    n = float(v) * (1e9 if u in "Bb" else 1e6)
    return n if 1e7 <= n <= 2e12 else None


# ---- libraries -------------------------------------------------------------------------------
FORMAT_LIB = {"gguf": "GGUF", "mlx": "MLX", "onnx": "ONNX", "safetensors": "safetensors", "openvino": "OpenVINO",
              "ctranslate2": "CTranslate2", "coreml": "Core ML", "tflite": "TFLite", "ggml": "GGML"}
TAG_LIB = {"transformers": "transformers", "diffusers": "diffusers", "sentence-transformers": "sentence-transformers",
           "peft": "PEFT", "timm": "timm", "open_clip": "open_clip", "transformers.js": "Transformers.js", "keras": "Keras",
           "jax": "JAX", "pytorch": "PyTorch", "gguf": "GGUF", "mlx": "MLX", "onnx": "ONNX", "safetensors": "safetensors",
           "openvino": "OpenVINO", "ctranslate2": "CTranslate2", "coreml": "Core ML", "tflite": "TFLite"}
FILE_LIB = {"model_index.json": "diffusers", "modules.json": "sentence-transformers", "adapter_config.json": "PEFT"}
LIB_ORDER = ["transformers", "diffusers", "sentence-transformers", "PEFT", "GGUF", "MLX", "safetensors", "ONNX", "PyTorch",
             "OpenVINO", "CTranslate2", "Core ML", "TFLite", "GGML", "timm", "open_clip", "Transformers.js", "Keras", "JAX"]

# ---- languages (ISO 639-1 plus HF's "multilingual") -------------------------------------------
LANGS = set("""aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es
et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv ka kg ki kj kk kl km kn
ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi
pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur
uz ve vi vo wa wo xh yi yo za zh zu""".split())


def langs_from_tags(tags):
    out = []
    for t in tags:
        t = t[len("language:"):] if t.startswith("language:") else t
        if t == "multilingual" or t in LANGS:
            if t not in out:
                out.append(t)
    return sorted(out)


# ---- apps (local apps that can run the row's weights) ---------------------------------------
LLM_TASKS = {"text-generation", "image-text-to-text", "text2text-generation", "any-to-any", "video-text-to-text",
             "audio-text-to-text", "visual-question-answering", "conversational", "translation", "summarization"}
EMBED_TASKS = {"feature-extraction", "sentence-similarity", "text-ranking"}
IMAGE_GEN = {"text-to-image", "image-to-image", "text-to-video"}
# rule table: (formats any of, task test, apps). First matching rules all add; order inside a rule is display order.
RULES = [
    ({"gguf"}, "llm", ["llama.cpp", "LM Studio", "Ollama", "Jan"]),
    ({"gguf"}, "embed", ["llama.cpp", "LM Studio", "Ollama"]),
    ({"gguf", "ggml"}, "asr", ["whisper.cpp"]),
    ({"mlx"}, "llm", ["MLX LM", "LM Studio"]),
    ({"safetensors"}, "llm", ["vLLM", "SGLang"]),
    ({"safetensors"}, "image", ["Draw Things", "DiffusionBee"]),
]
APP_ORDER = ["llama.cpp", "LM Studio", "Ollama", "Jan", "MLX LM", "vLLM", "SGLang", "whisper.cpp", "Draw Things", "DiffusionBee"]


def _kind(tasks):
    s = set(tasks)
    if not s or s & LLM_TASKS:
        return {"llm"}
    k = set()
    if s & EMBED_TASKS:
        k.add("embed")
    if "automatic-speech-recognition" in s:
        k.add("asr")
    if s & IMAGE_GEN:
        k.add("image")
    return k


def apps_for(formats, tasks):
    kinds = _kind(tasks)
    # an empty task list on a non-GGUF/MLX row says nothing about it: only gguf/mlx imply a language model
    fm = set(formats)
    tset = set(tasks)
    out = set()
    for rf, kind, apps in RULES:
        if not (rf & fm) or kind not in kinds:
            continue
        if not tset and not (fm & {"gguf", "mlx"}):
            continue
        out.update(apps)
    return sorted(out, key=APP_ORDER.index)


def libs_for(formats, files, api):
    out = set()
    for f in formats:
        if f in FORMAT_LIB:
            out.add(FORMAT_LIB[f])
    names = {p.split("/")[-1] for p in files}
    for n, lib in FILE_LIB.items():
        if n in names:
            out.add(lib)
    if api:
        for t in api.get("t", []):
            if t in TAG_LIB:
                out.add(TAG_LIB[t])
        ln = api.get("lib")
        if ln and ln in TAG_LIB:
            out.add(TAG_LIB[ln])
    elif "safetensors" in formats and "config.json" in names and "model_index.json" not in names:
        out.add("transformers")
    return sorted(out, key=LIB_ORDER.index)


# ---- API -------------------------------------------------------------------------------------
def fetch(mid, commit, tries=5):
    path = urllib.parse.quote(mid, safe="/")
    url = f"https://huggingface.co/api/models/{path}" + (f"/revision/{commit}" if commit else "") + \
        "?expand[]=tags&expand[]=library_name"
    i = waits = 0
    while i < tries:
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                j = json.loads(r.read())
            t = [x for x in j.get("tags", []) if x in TAG_LIB or x in LANGS or x == "multilingual" or x.startswith("language:")]
            return {"t": t, "lib": j.get("library_name")}
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404, 410):
                return {"t": [], "lib": None, "err": e.code}
            if e.code == 429 and waits < 40:
                # anonymous API quota (500 requests per 5 minutes): wait the window out, not a failed try
                waits += 1
                time.sleep(min(float(e.headers.get("Retry-After") or 30), 120) + 1)
                continue
            time.sleep(2 ** i)
        except Exception:
            time.sleep(2 ** i)
        i += 1
    return None


def load_cache(path):
    c = {}
    if path and os.path.exists(path):
        for line in open(path):
            try:
                o = json.loads(line)
                c[o["id"]] = o
            except Exception:
                pass
    return c


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--cache", default=os.path.join(os.path.expanduser("~"), ".cache", "freeweights", "hf-facets.jsonl"))
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--no-fetch", action="store_true", help="use the cache as is, make no requests")
    ap.add_argument("--limit", type=int, default=0, help="fetch at most N missing ids (testing)")
    ap.add_argument("--out", default=os.path.join(ROOT, "catalog", "overlay", "facets.json"))
    a = ap.parse_args()

    rows = json.load(open(os.path.join(ROOT, "catalog", "catalog.json")))["models"]
    rows = [r for r in rows if r.get("kind") != "tool"]
    man = {}
    for f in glob.glob(os.path.join(ROOT, "manifests", "*.json")):
        try:
            m = json.load(open(f))
            man[m["id"]] = m
        except Exception:
            pass

    cache = {} if a.offline else load_cache(a.cache)
    todo = [r for r in rows if r["id"] not in cache and r.get("kind") != "dataset"]
    if a.limit:
        todo = todo[:a.limit]
    if todo and not a.offline and not a.no_fetch:
        os.makedirs(os.path.dirname(a.cache), exist_ok=True)
        done = 0
        with open(a.cache, "a") as fh, cf.ThreadPoolExecutor(a.workers) as ex:
            def job(r):
                time.sleep(0.15)
                return r["id"], fetch(r["id"], ((man.get(r["id"]) or {}).get("upstream") or {}).get("commit"))
            for mid, res in ex.map(job, todo):
                if res is None:
                    continue
                cache[mid] = res
                fh.write(json.dumps({"id": mid, **res}) + "\n")
                fh.flush()
                done += 1
                if done % 500 == 0:
                    print(f"fetched {done}/{len(todo)}", file=sys.stderr)
        print(f"fetched {done} of {len(todo)} missing ids", file=sys.stderr)

    out = {"_meta": {"source": "catalog rows, manifests" + ("" if a.offline else ", Hugging Face model API tags/library_name at the pinned commit"),
                     "bins": [[c, l] for c, l, _ in BINS]}}
    for r in rows:
        mid = r["id"]
        api = cache.get(mid)
        files = [f["path"] for f in (man.get(mid) or {}).get("files", [])]
        p = r.get("params") or params_from_name(mid)
        e = {"params_bin": params_bin(p), "libraries": libs_for(r.get("formats", []), files, api),
             "languages": langs_from_tags((api or {}).get("t", [])), "apps": apps_for(r.get("formats", []), r.get("tasks", []))}
        if not r.get("params") and p:
            e["params_est"] = int(p)  # read from the name, not the file headers
        out[mid] = e
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w") as fh:
        json.dump(out, fh, separators=(",", ":"), sort_keys=True)
        fh.write("\n")
    n = len(out) - 1
    print(f"wrote {a.out}: {n} rows, bins {sum(1 for k,v in out.items() if k[0]!='_' and v['params_bin'])}, "
          f"languages {sum(1 for k,v in out.items() if k[0]!='_' and v['languages'])}, apps {sum(1 for k,v in out.items() if k[0]!='_' and v['apps'])}")


if __name__ == "__main__":
    main()
