import { describe, expect, it } from "vitest";
import { inline, parse, render, slug, slugger } from "../dev/markdown.mjs";

const html = (md: string) => render(parse(md));

describe("the guide's Markdown", () => {
  it("gives headings GitHub's anchors", () => {
    expect(slug("Outside: garden, fences and the roof")).toBe("outside-garden-fences-and-the-roof");
    expect(slug("Scan it (iPhone or iPad with LiDAR)")).toBe("scan-it-iphone-or-ipad-with-lidar");
    expect(slug("FAQ")).toBe("faq");
    expect(slug("Café 2 → 3 ✓ snake_case-ok")).toBe("café-2--3--snake_case-ok");
    const anchor = slugger();
    expect(["Garden", "Garden", "Garden-1", "Garden"].map(anchor)).toEqual(["garden", "garden-1", "garden-1-1", "garden-2"]);
    expect(html("## The `quality` option ##\n### **Bold** [link](#x)")).toBe(
      '<h2 id="the-quality-option">The <code>quality</code> option</h2>\n<h3 id="bold-link">' + '<strong>Bold</strong> <a href="#x">link</a></h3>',
    );
    expect(html("Title\n=====\n\nSub\n---")).toBe('<h1 id="title">Title</h1>\n<h2 id="sub">Sub</h2>');
  });

  it("joins a paragraph's lines and drops comments", () => {
    expect(html("<!--\nfor editors\n-->\n\nOne\ntwo  \nthree\\\nfour <!-- not shown -->")).toBe("<p>One\ntwo<br />\nthree<br />\nfour </p>");
  });

  it("escapes HTML everywhere", () => {
    expect(html('<script>alert("x")</script> & a&amp;b `<b>`')).toBe("<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; a&amp;b <code>&lt;b&gt;</code></p>");
    expect(html("```html\n<b>\"bold\"</b>\n```")).toBe('<pre><code class="language-html">&lt;b&gt;&quot;bold&quot;&lt;/b&gt;\n</code></pre>');
    expect(inline('[x](javascript:alert(1)) ![a"b](data:x) [y](" onclick=x)')).not.toMatch(/javascript:|data:|"\s*onclick/);
    expect(inline("[a](<x y.html> \"t\\\"\")")).toBe('<a href="x y.html" title="t&quot;">a</a>');
  });

  it("does bold, italics, code, strikethrough and escapes", () => {
    expect(inline("**Edit** → **Home**, *it*, _it_, snake_case, 2 * 3 * 4, ~~old~~, \\*not\\*, ***both***")).toBe(
      "<strong>Edit</strong> → <strong>Home</strong>, <em>it</em>, <em>it</em>, snake_case, 2 * 3 * 4, <del>old</del>, *not*, <em><strong>both</strong></em>",
    );
    expect(inline("`11'4\"` and ``a ` b`` and `**not bold**`")).toBe("<code>11&#39;4&quot;</code> and <code>a ` b</code> and <code>**not bold**</code>");
  });

  it("does links and images, with a label across lines", () => {
    expect(inline("[get your home\nin](#get-your-home-in) and [**b**](a.html \"T\")")).toBe(
      '<a href="#get-your-home-in">get your home\nin</a> and <a href="a.html" title="T"><strong>b</strong></a>',
    );
    expect(inline("![The `house` **view**](screenshots/house.jpg)")).toBe('<img src="screenshots/house.jpg" alt="The house view" />');
    expect(inline("[![logo](a.png)](https://x.org/a_(b))")).toBe('<a href="https://x.org/a_(b)"><img src="a.png" alt="logo" /></a>');
    expect(inline("See https://hacs.xyz. Or <https://x.org/?a=1&b=2>. [not a link] (here)")).toBe(
      'See <a href="https://hacs.xyz">https://hacs.xyz</a>. Or <a href="https://x.org/?a=1&amp;b=2">https://x.org/?a=1&amp;b=2</a>. [not a link] (here)',
    );
    const opts = { href: (url: string, kind: string) => `${kind}:${url}`, image: () => ' width="2"' };
    expect(inline("[a](#b) ![c](d.jpg)", opts)).toBe('<a href="link:#b">a</a> <img src="image:d.jpg" alt="c" width="2" />');
  });

  it("does tight, loose, ordered and nested lists", () => {
    expect(html("**Top bar**\n- one\n  two\n- three\nlazy")).toBe("<p><strong>Top bar</strong></p>\n<ul>\n<li>one\ntwo</li>\n<li>three\nlazy</li>\n</ul>");
    expect(html("1. a\n2. b\n\n3. c")).toBe("<ol>\n<li><p>a</p></li>\n<li><p>b</p></li>\n<li><p>c</p></li>\n</ol>");
    expect(html("3) a\n4) b")).toBe('<ol start="3">\n<li>a</li>\n<li>b</li>\n</ol>');
    expect(html("- a\n  - b\n    1. c\n  - d\n- e")).toBe(
      "<ul>\n<li>a\n<ul>\n<li>b\n<ol>\n<li>c</li>\n</ol></li>\n<li>d</li>\n</ul></li>\n<li>e</li>\n</ul>",
    );
    expect(html("- a\n\n  more\n- b")).toBe("<ul>\n<li><p>a</p>\n<p>more</p></li>\n<li><p>b</p></li>\n</ul>");
    expect(html("- a\n* b")).toBe("<ul>\n<li>a</li>\n</ul>\n<ul>\n<li>b</li>\n</ul>");
    expect(html("Born in\n2025. Not a list\n- - -")).toBe("<p>Born in\n2025. Not a list</p>\n<hr />");
    expect(html("- one\n\n```\ncode\n```\n> quoted **text**")).toBe(
      "<ul>\n<li>one</li>\n</ul>\n<pre><code>code\n</code></pre>\n<blockquote>\n<p>quoted <strong>text</strong></p>\n</blockquote>",
    );
  });

  it("does tables", () => {
    expect(html("| Option | Default |\n|:---|---:|\n| `a\\|b` | **x** |\n| short |")).toBe(
      '<table>\n<thead>\n<tr><th style="text-align: left">Option</th><th style="text-align: right">Default</th></tr>\n</thead>\n<tbody>\n' +
        '<tr><td style="text-align: left"><code>a|b</code></td><td style="text-align: right"><strong>x</strong></td></tr>\n' +
        '<tr><td style="text-align: left">short</td><td style="text-align: right"></td></tr>\n</tbody>\n</table>',
    );
    expect(html("a | b\n--|--")).toBe("<table>\n<thead>\n<tr><th>a</th><th>b</th></tr>\n</thead>\n</table>");
    expect(html("a | b\n--|--|--")).toBe("<p>a | b\n--|--|--</p>");
  });
});
