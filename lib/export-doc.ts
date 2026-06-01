import { RESUME_CSS } from "./resume-css";

/** Wrap filled resume HTML into a self-contained, downloadable/printable document. */
export function buildStandaloneHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${RESUME_CSS}
html,body{margin:0;background:#fff;}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
