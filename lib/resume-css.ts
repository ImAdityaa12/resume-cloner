/**
 * Canonical CSS for the rendered resume. Single source of truth used by both the
 * in-app preview (injected via a <style> tag) and the standalone HTML export, so the
 * exported document looks identical to what the user sees on screen.
 *
 * Everything is scoped under `.resume-sheet` so it can't leak into the app chrome.
 * Sizes mirror the source PDF (US-Letter, 0.75in margins) but flow rather than
 * absolutely position, so variable-length user data wraps gracefully.
 */
export const RESUME_CSS = String.raw`
.resume-sheet {
  --r-ink: #1f2937;
  --r-muted: #5b6472;
  --r-accent: #2f5496;
  --r-rule: #2f5496;
  --r-faint: #d8dee9;
  box-sizing: border-box;
  width: 100%;
  max-width: 816px;            /* 8.5in @ 96dpi */
  margin: 0 auto;
  padding: 56px 64px 64px;
  background: #fff;
  color: var(--r-ink);
  font-family: "Inter", "Helvetica Neue", Arial, "Segoe UI", sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.resume-sheet * { box-sizing: border-box; }

.resume-sheet .r-name {
  margin: 0;
  text-align: center;
  font-size: 33px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1f2d3d;
}
.resume-sheet .r-title {
  margin: 4px 0 0;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--r-accent);
}
.resume-sheet .r-contact {
  margin: 10px 0 4px;
  text-align: center;
  font-size: 11.5px;
  color: var(--r-muted);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px 6px;
}

.resume-sheet .r-section {
  margin: 22px 0 10px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--r-rule);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--r-accent);
}

.resume-sheet .r-entry { margin: 0 0 4px; }
.resume-sheet .r-entry-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}
.resume-sheet .r-entry-main { font-size: 14px; }
.resume-sheet .r-role { font-weight: 700; color: var(--r-ink); }
.resume-sheet .r-sep { color: var(--r-faint); margin: 0 4px; font-weight: 400; }
.resume-sheet .r-org { font-weight: 600; color: var(--r-accent); }
.resume-sheet .r-proj { font-weight: 700; color: var(--r-ink); }
.resume-sheet .r-stack { color: var(--r-accent); font-weight: 500; }
.resume-sheet .r-entry-meta {
  flex: 0 0 auto;
  text-align: right;
  font-style: italic;
  font-size: 11.5px;
  color: var(--r-muted);
  white-space: nowrap;
}

.resume-sheet .r-bullets {
  list-style: none;
  margin: 4px 0 12px;
  padding: 0;
}
.resume-sheet .r-bullets li {
  position: relative;
  padding-left: 16px;
  margin: 2px 0;
}
.resume-sheet .r-bullets li::before {
  content: "▸";
  position: absolute;
  left: 0;
  color: var(--r-accent);
}

.resume-sheet .r-skills {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 18px;
  margin: 4px 0 8px;
}
.resume-sheet .r-skills .r-k { font-weight: 600; color: var(--r-accent); }
.resume-sheet .r-skills .r-v { color: var(--r-ink); }

.resume-sheet .r-para { margin: 4px 0 10px; }
.resume-sheet .r-para.r-muted { color: var(--r-muted); font-size: 12.5px; }

@media print {
  .resume-sheet {
    max-width: none;
    width: auto;
    margin: 0;
    padding: 0;
    font-size: 11pt;
  }
  @page { size: letter; margin: 0.6in; }
}
`;
