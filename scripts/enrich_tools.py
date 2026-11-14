#!/usr/bin/env python3
"""Fill catalog/tools.json from each project's GitHub repository (stdlib + the gh CLI).

  python3 scripts/enrich_tools.py [--only ID ...]

For every tool whose url is a GitHub repository it records: description, license (SPDX id),
primary language, homepage, topics, the latest release (tag + date, pinned like a model's commit),
the commit sha the release tag points at and the default branch head, and a `fetched` date.
Install commands and the "use with Freeweights" line are curated below. Each install command is
checked against the project's README (and the extra docs listed): `install_verified` is true only
when every `check` string is found there. The site shows unverified commands as a link to the
project's own install page instead. `works_with` says which catalog entries a tool runs or trains.
Stars are not recorded: the site does not rank tools."""
import argparse, datetime, json, os, subprocess, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "catalog", "tools.json")

RUNS_TEXT = ["text-generation", "image-text-to-text"]
CURATED = {
    "comfyui": {"install": ["git clone https://github.com/comfyanonymous/ComfyUI", "cd ComfyUI && pip install -r requirements.txt", "python main.py"],
                "check": ["pip install -r requirements.txt", "python main.py"],
                "use": "# put the files in ComfyUI/models/ and open the publisher's workflow",
                "platforms": ["Windows", "macOS", "Linux"],
                "works_with": {"role": "runs", "sections": ["image", "video", "music"], "tasks": ["text-to-image", "image-to-image", "text-to-video", "image-to-video", "text-to-audio"]}},
    "llama-cpp": {"install": ["brew install llama.cpp"], "check": ["brew install llama.cpp"], "docs": ["docs/install.md"],
                  "use": "llama-server -m ./<file>.gguf --port 8080",
                  "platforms": ["macOS", "Linux", "Windows"],
                  "works_with": {"role": "runs", "formats": ["gguf"]}},
    "whisper-cpp": {"install": ["git clone https://github.com/ggml-org/whisper.cpp.git", "cd whisper.cpp && cmake -B build && cmake --build build -j --config Release"],
                    "check": ["cmake -B build", "cmake --build build"],
                    "use": "./build/bin/whisper-cli -m ./<model>.bin -f audio.wav   # convert the weights to ggml first",
                    "platforms": ["macOS", "Linux", "Windows", "iOS", "Android"],
                    "works_with": {"role": "runs", "match": "whisper"}},
    "mlx-lm": {"install": ["pip install mlx-lm"], "check": ["pip install mlx-lm"],
               "use": "mlx_lm.generate --model <id> --prompt \"Hello\"",
               "platforms": ["macOS (Apple silicon)"],
               "works_with": {"role": "runs", "formats": ["mlx"]}},
    "vllm": {"install": ["pip install vllm"], "check": ["pip install vllm"],
             "use": "HF_ENDPOINT=https://freeweights.allternit.com vllm serve <id>",
             "platforms": ["Linux (GPU)"],
             "works_with": {"role": "runs", "formats": ["safetensors"], "tasks": RUNS_TEXT}},
    "sglang": {"install": ["uv pip install --prerelease=allow sglang"], "check": ["uv pip install --prerelease=allow sglang"],
               "use": "HF_ENDPOINT=https://freeweights.allternit.com python3 -m sglang.launch_server --model-path <id>",
               "platforms": ["Linux (GPU)"],
               "works_with": {"role": "runs", "formats": ["safetensors"], "tasks": RUNS_TEXT}},
    "ollama": {"install": ["curl -fsSL https://ollama.com/install.sh | sh"], "check": ["curl -fsSL https://ollama.com/install.sh | sh"],
               "use": "printf 'FROM ./<file>.gguf\\n' > Modelfile && ollama create <name> -f Modelfile",
               "platforms": ["macOS", "Linux", "Windows"],
               "works_with": {"role": "runs", "formats": ["gguf"]}},
    "axolotl": {"install": ["uv pip install torch==2.14.0 torchvision", "uv pip install axolotl[deepspeed]"],
                "check": ["uv pip install axolotl[deepspeed]"],
                "use": "axolotl train config.yml   # base_model: <id>",
                "platforms": ["Linux (GPU)"],
                "works_with": {"role": "trains", "formats": ["safetensors"], "tasks": RUNS_TEXT}},
    "trl": {"install": ["pip install trl"], "check": ["pip install trl"],
            "use": "trl sft --model_name_or_path <id> --dataset_name <dataset>",
            "platforms": ["Linux", "macOS", "Windows"],
            "works_with": {"role": "trains", "formats": ["safetensors"], "tasks": RUNS_TEXT}},
    "peft": {"install": ["pip install peft"], "check": ["pip install peft"],
             "use": "# get_peft_model(AutoModelForCausalLM.from_pretrained(\"<id>\"), LoraConfig(...))",
             "platforms": ["Linux", "macOS", "Windows"],
             "works_with": {"role": "trains", "formats": ["safetensors"], "tasks": RUNS_TEXT}},
    "unsloth": {"install": ["pip install unsloth"], "check": ["pip install unsloth"],
                "use": "# FastLanguageModel.from_pretrained(\"<id>\")",
                "platforms": ["Linux (NVIDIA)", "Windows (NVIDIA)"],
                "works_with": {"role": "trains", "formats": ["safetensors"], "tasks": RUNS_TEXT}},
    "fw-py": {"install": ["# copy scripts/fw.py from the Freeweights repository"], "check": [],
              "use": "fw get <id>",
              "platforms": ["macOS", "Linux", "Windows (Python 3)"],
              "works_with": {"role": "gets", "all_hosted": True}},
}


def gh(path, raw=False):
    cmd = ["gh", "api", path] + (["-H", "Accept: application/vnd.github.raw"] if raw else [])
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        return None
    return r.stdout if raw else json.loads(r.stdout)


def today():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")


def enrich(t):
    cur = CURATED.get(t["id"], {})
    for k in ("install", "use", "platforms", "works_with"):
        if k in cur:
            t[k] = cur[k]
    u = urllib.parse.urlparse(t.get("url", ""))
    if u.netloc != "github.com":
        t["install_verified"] = False
        return t
    owner, repo = u.path.strip("/").split("/")[:2]
    info = gh(f"repos/{owner}/{repo}")
    if not info:
        print(f"fail {t['id']}: repository not readable", file=sys.stderr)
        return t
    owner, repo = info["owner"]["login"], info["name"]  # follows a moved repository
    gh_ = {"repo": f"{owner}/{repo}", "description": info.get("description") or "", "homepage": info.get("homepage") or "",
           "language": info.get("language") or "", "topics": info.get("topics") or [], "default_branch": info.get("default_branch") or "",
           "license": ((info.get("license") or {}).get("spdx_id") or "").replace("NOASSERTION", "")}
    head = gh(f"repos/{owner}/{repo}/commits/{gh_['default_branch']}") if gh_["default_branch"] else None
    gh_["branch_commit"] = (head or {}).get("sha", "")
    rel = gh(f"repos/{owner}/{repo}/releases/latest")
    if rel:
        gh_["release"] = {"tag": rel.get("tag_name", ""), "date": (rel.get("published_at") or "")[:10], "url": rel.get("html_url", "")}
        ref = gh(f"repos/{owner}/{repo}/commits/{urllib.parse.quote(rel.get('tag_name', ''))}")
        gh_["release"]["commit"] = (ref or {}).get("sha", "")
    text = gh(f"repos/{owner}/{repo}/readme", raw=True) or ""
    for d in cur.get("docs", []):
        text += "\n" + (gh(f"repos/{owner}/{repo}/contents/{d}", raw=True) or "")
    checks = cur.get("check", [])
    t["install_verified"] = bool(checks) and all(c in text for c in checks)
    t["install_docs"] = gh_["homepage"] or f"https://github.com/{owner}/{repo}#readme"
    gh_["fetched"] = today()
    t["github"] = gh_
    if gh_["license"]:
        t["license"] = gh_["license"]
    return t


def main():
    ap = argparse.ArgumentParser(prog="enrich_tools.py")
    ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    data = json.load(open(PATH))
    for t in data.get("tools", []):
        if a.only and t["id"] not in a.only:
            continue
        enrich(t)
        g = t.get("github", {})
        print(f"{t['id']:12} {g.get('license', t.get('license', '')):12} {(g.get('release') or {}).get('tag', '-'):14} install {'verified' if t.get('install_verified') else 'NOT verified'}")
    with open(PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
