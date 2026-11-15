"""XSS corpus for the safe Markdown renderer (site/lib/markdown.mjs, mdSafe).

Third-party Markdown (publisher READMEs, later user posts) must never produce an executable vector. The test
renders each hostile sample with the real renderer and checks the whole output: only our own tags appear, every
attribute is one we write, and every href is http, https, mailto or a same-page anchor.
"""
import json, os, re, shutil, subprocess, unittest
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ALLOWED_TAGS = {"p", "a", "b", "i", "s", "code", "pre", "div", "button", "span", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
                "table", "thead", "tbody", "tr", "th", "td", "blockquote", "hr", "svg", "path", "rect"}
ALLOWED_ATTRS = {"class", "href", "rel", "target", "id", "aria-label", "data-lang", "data-copy", "type", "viewbox", "d", "fill", "stroke",
                 "stroke-width", "stroke-linecap", "stroke-linejoin", "width", "height", "aria-hidden", "focusable", "xmlns", "rx", "x", "y", "points", "cx", "cy", "r"}

CORPUS = {
    "script": "<script>alert(1)</script>",
    "script-split": "<scr<script>ipt>alert(1)</scr</script>ipt>",
    "img-onerror": '<img src=x onerror=alert(1)>',
    "img-onerror-md": '![x" onerror="alert(1)](https://a.test/x.png)',
    "md-img-js": "![a](javascript:alert(1))",
    "js-link": "[click](javascript:alert(1))",
    "js-link-case": "[click](JaVaScRiPt:alert(1))",
    "js-link-tab": "[click](java\tscript:alert(1))",
    "js-link-newline": "[click](java&#10;script:alert(1))",
    "js-link-entity": "[click](&#106;avascript:alert(1))",
    "js-link-entity-hex": "[click](&#x6A;avascript:alert(1))",
    "js-link-ctrl": "[click](\u0001javascript:alert(1))",
    "js-link-space": "[click]( javascript:alert(1))",
    "data-url": "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
    "data-img": "![x](data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+)",
    "vbscript": "[x](vbscript:msgbox(1))",
    "file-url": "[x](file:///etc/passwd)",
    "proto-relative": "[x](//evil.test/a)",
    "backslash": "[x](\\\\evil.test\\a)",
    "svg": "<svg onload=alert(1)><circle/></svg>",
    "svg-md": "<svg><script>alert(1)</script></svg>",
    "iframe": '<iframe src="javascript:alert(1)"></iframe>',
    "iframe-srcdoc": '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    "object": '<object data="javascript:alert(1)"></object>',
    "embed": '<embed src="javascript:alert(1)">',
    "style": "<style>body{background:url(javascript:alert(1))}</style>",
    "form": '<form action="https://evil.test"><input name=x><button>go</button></form>',
    "meta-refresh": '<meta http-equiv="refresh" content="0;url=https://evil.test">',
    "base-tag": '<base href="https://evil.test/">',
    "a-onclick": '<a href="https://ok.test" onclick="alert(1)">x</a>',
    "a-js": '<a href="javascript:alert(1)">x</a>',
    "a-js-single": "<a href='javascript:alert(1)'>x</a>",
    "a-unquoted": "<a href=javascript:alert(1)>x</a>",
    "details-ontoggle": "<details open ontoggle=alert(1)>x</details>",
    "entities-lt": "&lt;script&gt;alert(1)&lt;/script&gt;",
    "entities-amp": "&amp;lt;script&amp;gt;alert(1)",
    "entities-numeric": "&#60;script&#62;alert(1)&#60;/script&#62;",
    "title-injection": '[x](https://ok.test "t\\" onmouseover=\\"alert(1)")',
    "title-injection-2": "[x](https://ok.test 'a' onmouseover='alert(1)')",
    "url-quote-break": '[x](https://ok.test/"onmouseover="alert(1))',
    "url-quote-angle": '[x](<https://ok.test/"onmouseover="alert(1)>)',
    "autolink-js": "<javascript:alert(1)>",
    "autolink-ok-break": '<https://ok.test/"onfocus="alert(1)>',
    "bare-url-break": 'see https://ok.test/a"onmouseover="alert(1) now',
    "heading": '# <img src=x onerror=alert(1)>\n## [x](javascript:alert(1)) {#a" onclick="alert(1)}',
    "heading-id": '# a "onmouseover="alert(1)',
    "code-fence-lang": '```js" onmouseover="alert(1)\n<script>alert(1)</script>\n```',
    "code-fence-close": "```\n</code></pre><script>alert(1)</script>\n```",
    "code-inline": "`</code><script>alert(1)</script>`",
    "table": "| a | b |\n|---|---|\n| <script>alert(1)</script> | [x](javascript:alert(1)) |",
    "table-img": "| a |\n|---|\n| ![x](javascript:alert(1)) |",
    "list": "- <img src=x onerror=alert(1)>\n  - [x](javascript:alert(1))",
    "quote": "> <script>alert(1)</script>\n> [x](javascript:alert(1))",
    "html-comment": "<!-- --><script>alert(1)</script><!-- -->",
    "html-comment-open": "<!--<script>alert(1)</script>",
    "cdata": "<![CDATA[<script>alert(1)</script>]]>",
    "null-byte": "<scr\u0000ipt>alert(1)</scr\u0000ipt>",
    "mailto-js": "[x](mailto:a@b.test?subject=x\"onmouseover=\"alert(1))",
    "relative-js": "[x](./javascript:alert(1))",
    "relative-escape": "[x](../../../../evil)",
    "emphasis-attr": '**<a href="x" onclick="alert(1)">**',
    "link-in-link": "[a [b](javascript:alert(1)) c](https://ok.test)",
    "badge-link": "[![x](javascript:alert(1))](javascript:alert(1))",
    "unicode-tricks": "[x](‮javascript:alert(1))\n[y](：javascript:alert(1))",
    "mathml": "<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>",
    "template": "<template><script>alert(1)</script></template>",
    "noscript": "<noscript><p title=\"</noscript><img src=x onerror=alert(1)>\">",
}
DANGER = re.compile(r"""href="(?!https?://|mailto:|#)|<script""", re.I)


class Audit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.problems = []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            self.problems.append(f"tag <{tag}>")
        for k, v in attrs:
            if k not in ALLOWED_ATTRS:
                self.problems.append(f"attribute {k} on <{tag}>")
            if k == "href":
                if not re.match(r"^(https?://|mailto:|#)", v or ""):
                    self.problems.append(f"href {v!r}")
                if v and re.search(r"[\s\"'<>\\\x00-\x1f]", v):
                    self.problems.append(f"href has unsafe char {v!r}")
                if tag == "a" and not (v or "").startswith("#") and not any(a == "rel" and "nofollow" in (b or "") and "noopener" in (b or "") and "ugc" in (b or "") for a, b in attrs):
                    self.problems.append("link without rel noopener nofollow ugc")
            if k == "id" and not re.match(r"^[A-Za-z0-9_-]+$", v or ""):
                self.problems.append(f"id {v!r}")
            if k == "data-lang" and not re.match(r"^[\w+.-]*$", v or ""):
                self.problems.append(f"data-lang {v!r}")
        self.handle_data  # noqa

    handle_startendtag = handle_starttag


@unittest.skipUnless(shutil.which("node"), "node not installed")
class MarkdownXss(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cases = [{"name": k, "md": v} for k, v in CORPUS.items()]
        p = subprocess.run(["node", os.path.join(ROOT, "tests", "xss_render.mjs")], input=json.dumps(cases), capture_output=True, text=True, cwd=ROOT, timeout=60)
        if p.returncode:
            raise RuntimeError(p.stderr)
        cls.out = {x["name"]: x["html"] for x in json.loads(p.stdout)}

    def test_every_sample_renders_only_our_markup(self):
        for name, html in self.out.items():
            a = Audit(); a.feed(html); a.close()
            self.assertEqual(a.problems, [], f"{name}: {a.problems}\n{html}")

    def test_no_executable_text_survives_as_markup(self):
        for name, html in self.out.items():
            # Dangerous words may appear as escaped text; they must never sit inside a tag or attribute.
            for tag in re.findall(r"<[^>]*>", html):
                self.assertIsNone(DANGER.search(tag), f"{name}: {tag}\n{html}")

    def test_no_lt_from_input_is_raw(self):
        for name, html in self.out.items():
            self.assertNotIn("<script", html.lower(), name)
            self.assertNotIn("<img", html.lower(), name)
            self.assertNotIn("<iframe", html.lower(), name)

    def test_real_markdown_still_renders(self):
        md = "# Title\n\nSome **bold** and `code` with [a link](https://example.com/x) and ![logo](https://example.com/l.png).\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```python\nprint('<hi>')\n```\n\n- one\n- two\n"
        p = subprocess.run(["node", os.path.join(ROOT, "tests", "xss_render.mjs")], input=json.dumps([{"name": "ok", "md": md}]), capture_output=True, text=True, cwd=ROOT)
        html = json.loads(p.stdout)[0]["html"]
        for want in ('<h3 id="mc-title">', "<b>bold</b>", "<code>code</code>", 'href="https://example.com/x"', "Image: logo", "<table", "&lt;hi&gt;", "<li>one</li>"):
            self.assertIn(want, html)
        self.assertNotIn("<img", html)

    def test_relative_links_resolve_to_the_pinned_tree(self):
        p = subprocess.run(["node", os.path.join(ROOT, "tests", "xss_render.mjs")], input=json.dumps([{"name": "r", "md": "[lic](LICENSE) [up](../../x) [h](#Usage)"}]), capture_output=True, text=True, cwd=ROOT)
        html = json.loads(p.stdout)[0]["html"]
        self.assertIn('href="https://huggingface.co/acme/model/blob/abc1234/LICENSE"', html)
        self.assertIn('href="#mc-usage"', html)


if __name__ == "__main__":
    unittest.main()
