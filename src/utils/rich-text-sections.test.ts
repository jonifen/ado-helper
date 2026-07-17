// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { parseRichTextSections } from "./rich-text-sections.js";

describe("parseRichTextSections", () => {
  it("returns an empty array for empty input", () => {
    expect(parseRichTextSections("")).toEqual([]);
    expect(parseRichTextSections("   ")).toEqual([]);
  });

  it("returns a single headless section when there are no headings", () => {
    const sections = parseRichTextSections("<p>Just some content</p>");
    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBeNull();
    expect(sections[0]?.html).toBe("<p>Just some content</p>");
  });

  it("splits content into one section per heading", () => {
    const html =
      "<h2>Background</h2><p>Some context</p><h2>Steps</h2><ul><li>One</li><li>Two</li></ul>";
    const sections = parseRichTextSections(html);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ heading: "Background", level: 2 });
    expect(sections[0]?.html).toBe("<p>Some context</p>");
    expect(sections[1]).toMatchObject({ heading: "Steps", level: 2 });
    expect(sections[1]?.html).toContain("<li>One</li>");
  });

  it("unwraps a single outer wrapper div so nested headings still split", () => {
    const html =
      "<div><h3>First</h3><p>A</p><h3>Second</h3><p>B</p></div>";
    const sections = parseRichTextSections(html);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.heading).toBe("First");
    expect(sections[0]?.html).toBe("<p>A</p>");
    expect(sections[1]?.heading).toBe("Second");
    expect(sections[1]?.html).toBe("<p>B</p>");
  });

  it("keeps leading content before the first heading as a headless section", () => {
    const html = "<p>Intro</p><h2>Details</h2><p>More</p>";
    const sections = parseRichTextSections(html);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.heading).toBeNull();
    expect(sections[0]?.html).toBe("<p>Intro</p>");
    expect(sections[1]?.heading).toBe("Details");
  });

  it("converts a literal '---' line into a horizontal rule", () => {
    expect(parseRichTextSections("<p>---</p>")[0]?.html).toBe("<hr>");
    expect(parseRichTextSections("<div>---</div>")[0]?.html).toBe("<hr>");
  });

  it("leaves genuinely inline code untouched", () => {
    const sections = parseRichTextSections("<p>Call <code>foo()</code> first</p>");
    expect(sections[0]?.html).toBe("<p>Call <code>foo()</code> first</p>");
  });

  it("collapses redundant nested code tags to a single inline code element", () => {
    const sections = parseRichTextSections(
      "<p><code><code><code>RestHrefResponse</code></code></code></p>",
    );
    expect(sections[0]?.html).toBe("<p><code>RestHrefResponse</code></p>");
  });

  it("converts a multi-line <code> using <br> into a <pre><code> block, preserving every line", () => {
    const html =
      "<li><code>{<br>&nbsp; &quot;a&quot;: 1,<br>&nbsp; &quot;b&quot;: 2<br>}</code></li>";
    const sections = parseRichTextSections(`<ul>${html}</ul>`);
    const rendered = sections[0]?.html || "";

    expect(rendered).toContain("<pre><code>");
    expect(rendered).toContain('"a": 1');
    expect(rendered).toContain('"b": 2');
  });

  it("pulls a line wrapped in a bare <div> back into the surrounding code block instead of losing its styling", () => {
    // Mirrors ADO's actual output: a stray <div> line nested inside one
    // big multi-line <code> element (alongside <span>-wrapped lines).
    const html =
      "<li><code>{<br><span>&quot;headers&quot;: {<br></span><div>&nbsp; &nbsp; &quot;x-api-version&quot;: &quot;3.0&quot;<br></div><span>}</span><br>}</code></li>";
    const sections = parseRichTextSections(`<ul>${html}</ul>`);
    const rendered = sections[0]?.html || "";

    // The whole thing becomes one <pre><code> block, so the div's line no
    // longer breaks out and renders unstyled in the middle of the snippet.
    expect(rendered).not.toContain("<div>");
    expect(rendered.match(/<pre>/g)).toHaveLength(1);
    expect(rendered).toContain("x-api-version");
  });

  it("converts ==text== into a yellow highlight mark", () => {
    const sections = parseRichTextSections("<p>This is ==important== info</p>");
    expect(sections[0]?.html).toBe(
      '<p>This is <mark data-color="yellow">important</mark> info</p>',
    );
  });

  it("converts !!text!! into a red highlight mark", () => {
    const sections = parseRichTextSections("<p>This is !!urgent!! info</p>");
    expect(sections[0]?.html).toBe(
      '<p>This is <mark data-color="red">urgent</mark> info</p>',
    );
  });

  it("handles multiple highlights of both colors in one line", () => {
    const sections = parseRichTextSections("<p>==one== and !!two!! and ==three==</p>");
    expect(sections[0]?.html).toBe(
      '<p><mark data-color="yellow">one</mark> and <mark data-color="red">two</mark> and <mark data-color="yellow">three</mark></p>',
    );
  });

  it("does not apply highlight syntax inside code blocks", () => {
    const sections = parseRichTextSections("<p>Call <code>a==b==c</code> now</p>");
    expect(sections[0]?.html).toBe("<p>Call <code>a==b==c</code> now</p>");
  });

  it("does not apply highlight syntax inside converted pre/code blocks", () => {
    const html = "<li><code>{<br>&nbsp; ==not a highlight==<br>}</code></li>";
    const sections = parseRichTextSections(`<ul>${html}</ul>`);
    expect(sections[0]?.html).not.toContain("<mark");
    expect(sections[0]?.html).toContain("==not a highlight==");
  });
});
