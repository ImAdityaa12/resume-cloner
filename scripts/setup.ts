/**
 * One-shot setup: create the schema, convert the sample resume template PDF into an
 * HTML template, and seed five users. Re-runnable (it clears existing rows first).
 *
 *   npx tsx scripts/setup.ts [path-to-template.pdf]
 */
import { readFileSync } from "node:fs";
import { ensureSchema, sql, saveTemplate, upsertUser } from "../lib/db.ts";
import { convertPdfToHtml } from "../lib/pdf-to-html.ts";
import { PROFILES, profileToData } from "./seed-data.ts";

const DEFAULT_PDF = "C:/Users/Lenovo/Downloads/resume_template.pdf";

async function main() {
  // Load DATABASE_URL from .env.local (Next.js loads it automatically at runtime).
  try {
    process.loadEnvFile(".env.local");
  } catch {
    /* env may already be present */
  }

  const pdfPath = process.argv[2] || DEFAULT_PDF;

  // Drop any stale tables (an earlier design left empty, incompatible tables behind),
  // then (re)create the schema cleanly.
  console.log("→ Dropping stale tables…");
  await sql()`DROP TABLE IF EXISTS users`;
  await sql()`DROP TABLE IF EXISTS templates`;

  console.log("→ Creating schema…");
  await ensureSchema();

  console.log(`→ Converting template PDF: ${pdfPath}`);
  const pdf = readFileSync(pdfPath);
  const { html, keys } = await convertPdfToHtml(pdf);
  console.log(`   extracted ${keys.length} placeholder keys`);
  await saveTemplate("resume_template.pdf", html, keys);

  console.log("→ Seeding users…");
  for (const profile of PROFILES) {
    await upsertUser({
      full_name: profile.name,
      job_title: profile.title,
      email: profile.email,
      data: profileToData(profile),
    });
    console.log(`   • ${profile.name} — ${profile.title}`);
  }

  console.log("\n✓ Setup complete: 1 template, " + PROFILES.length + " users.");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
