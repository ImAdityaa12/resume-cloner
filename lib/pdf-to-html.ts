/**
 * PDF → HTML template converter.
 *
 * Uses unpdf (a serverless build of pdf.js) to extract every text run from the uploaded PDF together with its
 * page position (x / y) and font size, then reconstructs *semantic, reflowable* HTML
 * from that geometry. Placeholders such as `{{FULL_NAME}}` survive the conversion as
 * literal text so they can later be filled with per-user data.
 *
 * The classification is driven by measured geometry (font size relative to the body
 * size, left margin, a right-hand column zone, bullet markers) rather than hard-coded
 * field names, so it generalises to resumes with the same visual structure.
 */
import { getDocumentProxy } from "unpdf";

export interface ConvertResult {
  html: string;
  keys: string[];
}

interface Seg {
  str: string;
  x: number;
  top: number;
  size: number;
  width: number;
}

interface Line {
  segs: Seg[];
  top: number;
  size: number; // largest font size on the line
  minX: number; // x of first non-blank segment
}

const PLACEHOLDER_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isBlank(s: string): boolean {
  return s.trim().length === 0;
}

/** Extract text segments with geometry from every page, in reading order. */
async function extractSegments(data: Uint8Array): Promise<{ segs: Seg[][]; pageWidth: number }> {
  // unpdf re-exports pdf.js, whose bundled types are stricter than its runtime API; use loose typing.
  const doc: any = await getDocumentProxy(data, { useSystemFonts: true, isEvalSupported: false } as any);
  const pages: Seg[][] = [];
  let pageWidth = 612;
  for (let p = 1; p <= doc.numPages; p++) {
    const page: any = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    pageWidth = viewport.width;
    const tc: any = await page.getTextContent();
    const segs: Seg[] = [];
    for (const it of tc.items as any[]) {
      if (typeof it.str !== "string" || it.str.length === 0) continue;
      const [a, b, , d, e, f] = it.transform as number[];
      const size = Math.hypot(b, d) || Math.hypot(a, b) || 10;
      segs.push({ str: it.str, x: e, top: viewport.height - f, size, width: it.width || 0 });
    }
    pages.push(segs);
  }
  // Best-effort cleanup; `destroy` isn't present in every pdfjs build/runtime.
  if (typeof doc.destroy === "function") await doc.destroy();
  return { segs: pages, pageWidth };
}

/** Group segments into lines by vertical position. */
function buildLines(segs: Seg[]): Line[] {
  const sorted = [...segs].sort((s1, s2) => s1.top - s2.top || s1.x - s2.x);
  const lines: Line[] = [];
  for (const s of sorted) {
    const last = lines[lines.length - 1];
    const tol = Math.max(s.size, last?.size ?? 0) * 0.5;
    if (last && Math.abs(s.top - last.top) <= tol) {
      last.segs.push(s);
      last.size = Math.max(last.size, s.size);
    } else {
      lines.push({ segs: [s], top: s.top, size: s.size, minX: s.x });
    }
  }
  for (const l of lines) {
    l.segs.sort((a, b) => a.x - b.x);
    const firstReal = l.segs.find((s) => !isBlank(s.str));
    l.minX = firstReal ? firstReal.x : l.segs[0].x;
  }
  return lines;
}

type Block =
  | { kind: "name"; text: string }
  | { kind: "title"; text: string }
  | { kind: "contact"; text: string }
  | { kind: "section"; text: string }
  | { kind: "entry"; main: string; meta: string[] }
  | { kind: "para"; text: string; muted: boolean }
  | { kind: "bullets"; items: string[] }
  | { kind: "skills"; rows: { k: string; v: string }[] };

const ALL_CAPS_RE = /^[A-Z][A-Z0-9 &/().,'-]*$/;

export async function convertPdfToHtml(input: Uint8Array | Buffer): Promise<ConvertResult> {
  // pdfjs rejects Node Buffers (which subclass Uint8Array), so copy into a plain one.
  const data = Uint8Array.from(input);
  const { segs, pageWidth } = await extractSegments(data);

  // Flatten lines across pages (resume reflows; print handles pagination).
  const allLines: Line[] = [];
  for (const pageSegs of segs) allLines.push(...buildLines(pageSegs));

  // Derive layout constants from the document itself.
  const leftMargin = Math.min(...allLines.map((l) => l.minX));
  const sizeCounts = new Map<number, number>();
  for (const l of allLines)
    for (const s of l.segs)
      if (!isBlank(s.str)) sizeCounts.set(Math.round(s.size), (sizeCounts.get(Math.round(s.size)) ?? 0) + 1);
  const bodySize = [...sizeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 10;
  const rightX = pageWidth * 0.58;
  const pageCenter = pageWidth / 2;

  const blocks: Block[] = [];
  let openEntry: Extract<Block, { kind: "entry" }> | null = null;

  const closeEntry = () => {
    openEntry = null;
  };

  const RIGHT_GAP = 90; // a real two-column row has a wide blank gutter before the right block

  for (const line of allLines) {
    const real = line.segs.filter((s) => !isBlank(s.str)).sort((a, b) => a.x - b.x);
    if (real.length === 0) continue;

    // Split a line into left/right columns only when there's a wide gutter before a
    // block that begins in the right zone — this keeps continuous centered lines
    // (e.g. the contact row) intact while still detecting job/education date columns.
    const isRightOnly = real[0].x >= rightX;
    let splitIdx = -1;
    if (!isRightOnly) {
      for (let i = 1; i < real.length; i++) {
        const gap = real[i].x - (real[i - 1].x + real[i - 1].width);
        if (real[i].x >= rightX && gap >= RIGHT_GAP) {
          splitIdx = i;
          break;
        }
      }
    }
    // Geometry decisions use `real` (non-blank) segments; text reconstruction uses ALL
    // segments so the blank-space runs between tokens are preserved.
    const boundaryX = splitIdx >= 0 ? real[splitIdx].x : Infinity;
    const leftReal = isRightOnly ? [] : splitIdx >= 0 ? real.slice(0, splitIdx) : real;
    const joinText = (arr: Seg[]) => arr.map((s) => s.str).join("").replace(/\s+/g, " ").trim();
    const leftText = isRightOnly ? "" : joinText(line.segs.filter((s) => s.x < boundaryX));
    const rightText = isRightOnly ? joinText(line.segs) : joinText(line.segs.filter((s) => s.x >= boundaryX));
    const hasLeft = leftText.length > 0;
    const hasRight = rightText.length > 0;

    const lineCenter = (real[0].x + (real[real.length - 1].x + real[real.length - 1].width)) / 2;
    const centered = !hasRight && Math.abs(lineCenter - pageCenter) < 80 && real[0].x > leftMargin + 30;
    const fullText = joinText(line.segs);
    const hasPlaceholder = /\{\{/.test(fullText);
    const atLeftMargin = real[0].x <= leftMargin + 4;

    // --- Right-only continuation: append to the open entry's meta column. ---
    if (!hasLeft && hasRight) {
      if (openEntry) {
        openEntry.meta.push(rightText);
        continue;
      }
      blocks.push({ kind: "para", text: rightText, muted: true });
      continue;
    }

    // --- Centered header block (name / title / contact). ---
    if (centered) {
      closeEntry();
      if (/[•·|]/.test(fullText) || /\p{Extended_Pictographic}/u.test(fullText)) {
        blocks.push({ kind: "contact", text: fullText });
      } else if (line.size >= bodySize + 8) {
        blocks.push({ kind: "name", text: fullText });
      } else {
        blocks.push({ kind: "title", text: fullText });
      }
      continue;
    }

    // --- Section header: left margin, larger than body, ALL CAPS, no placeholder. ---
    if (
      !hasRight &&
      atLeftMargin &&
      line.size >= bodySize + 0.5 &&
      !hasPlaceholder &&
      ALL_CAPS_RE.test(fullText) &&
      fullText.length <= 48
    ) {
      closeEntry();
      blocks.push({ kind: "section", text: fullText });
      continue;
    }

    // --- Bullet line. ---
    const isBullet = /^[▸‣•◦·\-–]\s*$/.test(real[0].str.trim());
    if (isBullet) {
      const text = joinText(line.segs.filter((s) => s !== real[0]));
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "bullets") last.items.push(text);
      else blocks.push({ kind: "bullets", items: [text] });
      continue;
    }

    // --- Entry header (job / education): left content + right meta column. ---
    if (hasLeft && hasRight) {
      const entry: Extract<Block, { kind: "entry" }> = { kind: "entry", main: leftText, meta: [rightText] };
      blocks.push(entry);
      openEntry = entry;
      continue;
    }

    closeEntry();

    // --- Sub-header (project / cert name lines): bigger than body, has placeholder. ---
    if (line.size >= bodySize + 0.4 && hasPlaceholder) {
      blocks.push({ kind: "entry", main: leftText, meta: [] });
      continue;
    }

    // --- Key/value row (skills): a plain label, a gap, then a value. ---
    if (atLeftMargin) {
      const gap = detectKeyValue(leftReal);
      if (gap) {
        const last = blocks[blocks.length - 1];
        if (last && last.kind === "skills") last.rows.push(gap);
        else blocks.push({ kind: "skills", rows: [gap] });
        continue;
      }
    }

    // --- Default paragraph. ---
    blocks.push({ kind: "para", text: fullText, muted: line.size < bodySize - 0.25 });
  }

  const html = renderBlocks(blocks);
  const keys = collectKeys(allLines);
  return { html, keys };
}

/** Detect a "Label    {{VALUE}}" row: a non-placeholder label, a visual gap, then the rest. */
function detectKeyValue(real: Seg[]): { k: string; v: string } | null {
  if (real.length < 2) return null;
  for (let i = 0; i < real.length - 1; i++) {
    const gap = real[i + 1].x - (real[i].x + real[i].width);
    const label = real
      .slice(0, i + 1)
      .map((s) => s.str)
      .join("")
      .trim();
    const value = real
      .slice(i + 1)
      .map((s) => s.str)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (gap >= 24 && label.length > 0 && !/\{\{/.test(label) && value.length > 0) {
      return { k: label, v: value };
    }
  }
  return null;
}

/** Render the main text of an entry header, styling role | company or name — stack. */
function renderEntryMain(main: string): string {
  if (main.includes("|")) {
    const idx = main.indexOf("|");
    const role = main.slice(0, idx).trim();
    const org = main.slice(idx + 1).trim();
    return `<span class="r-role">${esc(role)}</span><span class="r-sep">|</span><span class="r-org">${esc(org)}</span>`;
  }
  const dashMatch = main.match(/\s[—–]\s/);
  if (dashMatch) {
    const idx = main.indexOf(dashMatch[0]);
    const name = main.slice(0, idx).trim();
    const rest = main.slice(idx + dashMatch[0].length).trim();
    return `<span class="r-proj">${esc(name)}</span> — <span class="r-stack">${esc(rest)}</span>`;
  }
  return `<span class="r-role">${esc(main)}</span>`;
}

/** Merge meta lines, joining a trailing en/em-dash line with the following line. */
function renderMeta(meta: string[]): string {
  const cleaned: string[] = [];
  for (const raw of meta) {
    const line = raw.trim();
    if (!line) continue;
    const prev = cleaned[cleaned.length - 1];
    if (prev && /[–—-]$/.test(prev.trim())) {
      cleaned[cleaned.length - 1] = `${prev} ${line}`;
    } else {
      cleaned.push(line);
    }
  }
  return cleaned.map((l) => esc(l)).join("<br>");
}

function renderBlocks(blocks: Block[]): string {
  const out: string[] = ['<article class="resume-sheet">'];
  for (const b of blocks) {
    switch (b.kind) {
      case "name":
        out.push(`<h1 class="r-name">${esc(b.text)}</h1>`);
        break;
      case "title":
        out.push(`<p class="r-title">${esc(b.text)}</p>`);
        break;
      case "contact":
        out.push(`<p class="r-contact">${esc(b.text)}</p>`);
        break;
      case "section":
        out.push(`<h2 class="r-section">${esc(b.text)}</h2>`);
        break;
      case "entry": {
        const meta = renderMeta(b.meta);
        out.push(
          `<div class="r-entry"><div class="r-entry-head"><div class="r-entry-main">${renderEntryMain(
            b.main,
          )}</div>${meta ? `<div class="r-entry-meta">${meta}</div>` : ""}</div></div>`,
        );
        break;
      }
      case "bullets":
        out.push(`<ul class="r-bullets">${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`);
        break;
      case "skills":
        out.push(
          `<div class="r-skills">${b.rows
            .map((r) => `<span class="r-k">${esc(r.k)}</span><span class="r-v">${esc(r.v)}</span>`)
            .join("")}</div>`,
        );
        break;
      case "para":
        out.push(`<p class="r-para${b.muted ? " r-muted" : ""}">${esc(b.text)}</p>`);
        break;
    }
  }
  out.push("</article>");
  return out.join("\n");
}

function collectKeys(lines: Line[]): string[] {
  const seen = new Set<string>();
  for (const l of lines) {
    const text = l.segs.map((s) => s.str).join("");
    let m: RegExpExecArray | null;
    PLACEHOLDER_RE.lastIndex = 0;
    while ((m = PLACEHOLDER_RE.exec(text)) !== null) seen.add(m[1]);
  }
  return [...seen];
}

/** Extract just the placeholder keys present in an already-converted HTML string. */
export function extractKeysFromHtml(html: string): string[] {
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((m = PLACEHOLDER_RE.exec(html)) !== null) seen.add(m[1]);
  return [...seen];
}
