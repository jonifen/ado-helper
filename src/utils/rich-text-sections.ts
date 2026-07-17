export type RichTextSectionType = {
  id: string;
  heading: string | null;
  level: number | null;
  html: string;
};

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const CONTAINER_TAGS = new Set(["DIV", "SECTION", "BODY", "SPAN"]);

type BlockType =
  | { kind: "heading"; text: string; level: number }
  | { kind: "content"; html: string };

const HR_TEXT = /^-{3,}$/;
const CODE_BLOCK_MARKER_SELECTOR = "br, div, p, li";
const FLATTEN_BLOCK_TAGS = new Set(["DIV", "P", "LI", "UL", "OL"]);

// ADO's rich-text editor represents "code" as inline <code> elements, even
// for multi-line snippets (using <br> for line breaks). Some lines end up
// wrapped in a bare <div> instead of staying inline, which breaks out of
// the <code> element entirely and loses the monospace/code styling. Any
// <code> that contains a <br> or a block element is therefore treated as
// a block of code and rebuilt as a real <pre><code>, flattening its content
// to plain text so line breaks are preserved and rendered as one block.
function flattenCodeToText(el: Element): string {
  let result = "";

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = (node as Element).tagName;
    if (tag === "BR") {
      result += "\n";
      return;
    }

    const isBlock = FLATTEN_BLOCK_TAGS.has(tag);
    if (isBlock && result.length > 0 && !result.endsWith("\n")) {
      result += "\n";
    }
    Array.from(node.childNodes).forEach(walk);
    if (isBlock && !result.endsWith("\n")) {
      result += "\n";
    }
  };

  Array.from(el.childNodes).forEach(walk);

  return result
    .replace(/ /g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function collapseRedundantCodeNesting(root: ParentNode) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const inner of Array.from(root.querySelectorAll("code > code:only-child"))) {
      const outer = inner.parentElement;
      if (outer?.tagName === "CODE" && outer.childNodes.length === 1) {
        outer.replaceWith(inner);
        changed = true;
      }
    }
  }
}

function normalizeCodeBlocks(root: ParentNode) {
  collapseRedundantCodeNesting(root);

  for (const codeEl of Array.from(root.querySelectorAll("code"))) {
    if (!codeEl.isConnected || !codeEl.querySelector(CODE_BLOCK_MARKER_SELECTOR)) {
      continue;
    }

    const doc = codeEl.ownerDocument;
    const pre = doc.createElement("pre");
    const code = doc.createElement("code");
    code.textContent = flattenCodeToText(codeEl);
    pre.appendChild(code);
    codeEl.replaceWith(pre);
  }
}

// `==text==` and `!!text!!` aren't understood by ADO's rich-text editor
// either — they pass through as literal text — so they're converted into
// <mark data-color> highlights the same way as the equivalent feature in
// the second-brain project, skipping any text inside code/pre.
const HIGHLIGHT_RE = /==([^=\n]+)==|!!([^!\n]+)!!/g;

function isInsideCodeOrPre(node: Node): boolean {
  let el = node.parentElement;
  while (el) {
    if (el.tagName === "CODE" || el.tagName === "PRE") return true;
    el = el.parentElement;
  }
  return false;
}

function applyHighlightMarks(root: Element) {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n: Node) {
      return isInsideCodeOrPre(n)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) textNodes.push(current as Text);

  for (const textNode of textNodes) {
    const text = textNode.textContent || "";
    HIGHLIGHT_RE.lastIndex = 0;
    if (!HIGHLIGHT_RE.test(text)) continue;
    HIGHLIGHT_RE.lastIndex = 0;

    const frag = doc.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = HIGHLIGHT_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)));
      }
      const isYellow = match[1] !== undefined;
      const mark = doc.createElement("mark");
      mark.setAttribute("data-color", isYellow ? "yellow" : "red");
      mark.textContent = (isYellow ? match[1] : match[2]) || "";
      frag.appendChild(mark);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      frag.appendChild(doc.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
}

// Applied per-section, after splitting, rather than on the whole document
// up front: mutating text nodes into <mark> elements changes which
// top-level <div>s have element children, which would otherwise confuse
// collectBlocks' wrapper-unwrapping heuristic.
function applyHighlightsToHtml(html: string): string {
  if (!html) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  applyHighlightMarks(doc.body);
  return doc.body.innerHTML;
}

function collectBlocks(node: Node, blocks: BlockType[]) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) {
        blocks.push({
          kind: "content",
          html: HR_TEXT.test(text) ? "<hr />" : `<p>${text}</p>`,
        });
      }
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const el = child as Element;
    const tag = el.tagName;

    if (HEADING_TAGS.has(tag)) {
      blocks.push({
        kind: "heading",
        text: el.textContent?.trim() || "",
        level: Number(tag[1]),
      });
    } else if (CONTAINER_TAGS.has(tag) && el.children.length > 0) {
      // Unwrap wrapper elements (e.g. a single outer <div>) so headings
      // nested inside them are still treated as section boundaries.
      collectBlocks(el, blocks);
    } else if (tag !== "HR" && el.children.length === 0 && HR_TEXT.test(el.textContent?.trim() || "")) {
      // A line typed as a literal "---" (e.g. inside a <p>) reads as a
      // horizontal rule, not literal dashes.
      blocks.push({ kind: "content", html: "<hr />" });
    } else {
      blocks.push({ kind: "content", html: el.outerHTML });
    }
  }
}

function buildSections(blocks: BlockType[]): RichTextSectionType[] {
  const sections: RichTextSectionType[] = [];
  let heading: string | null = null;
  let level: number | null = null;
  let parts: string[] = [];
  let sectionIndex = 0;

  const flush = () => {
    if (heading !== null || parts.length > 0) {
      sections.push({
        id: `section-${sectionIndex++}`,
        heading,
        level,
        html: parts.join(""),
      });
    }
  };

  for (const block of blocks) {
    if (block.kind === "heading") {
      flush();
      heading = block.text;
      level = block.level;
      parts = [];
    } else {
      parts.push(block.html);
    }
  }
  flush();

  return sections;
}

/**
 * Splits ADO rich-text HTML (Description / Acceptance Criteria) into
 * sections, one per heading, each containing everything up to the next
 * heading. Content with no headings is returned as a single headless
 * section; empty input returns an empty array.
 */
export function parseRichTextSections(html: string): RichTextSectionType[] {
  if (!html || !html.trim()) return [];

  const doc = new DOMParser().parseFromString(html, "text/html");
  normalizeCodeBlocks(doc.body);
  const blocks: BlockType[] = [];
  collectBlocks(doc.body, blocks);

  return buildSections(blocks).map((section) => ({
    ...section,
    html: applyHighlightsToHtml(section.html),
  }));
}
