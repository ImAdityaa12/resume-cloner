import { NextResponse } from "next/server";
import { getActiveTemplate, saveTemplate } from "@/lib/db";
import { convertPdfToHtml } from "@/lib/pdf-to-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — the currently active (most recently uploaded) template. */
export async function GET() {
  const template = await getActiveTemplate();
  if (!template) return NextResponse.json({ error: "No template uploaded yet" }, { status: 404 });
  return NextResponse.json(template);
}

/** POST — upload a sample resume PDF, convert it to an HTML template, and store it. */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected a 'file' field with a PDF" }, { status: 400 });
  }
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 415 });
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { html, keys } = await convertPdfToHtml(bytes);
    if (keys.length === 0) {
      return NextResponse.json(
        { error: "No {{PLACEHOLDER}} keys were found in this PDF. Upload a template that uses {{KEY}} tokens." },
        { status: 422 },
      );
    }
    const template = await saveTemplate(file.name || "uploaded.pdf", html, keys);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("PDF conversion failed:", err);
    return NextResponse.json({ error: "Failed to convert the PDF" }, { status: 500 });
  }
}
