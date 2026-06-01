# Resume Cloner

Upload a **sample resume PDF** containing `{{PLACEHOLDER}}` tokens, and the app converts
it to a styled, reflowable **HTML template**. It then fills that template with each
candidate's details pulled from a **Neon Postgres** database and renders a live preview
you can export to PDF or HTML.

- **Left** — the list of candidates (users) from the database.
- **Right** — the selected candidate's resume, generated from the converted template.

## How it works

```
sample.pdf ──▶ pdfjs-dist (extract positioned text)
            ──▶ geometry-based reconstruction ──▶ HTML template with {{KEYS}}  (stored in DB)

users table (JSONB data per key) ──▶ fill {{KEY}} → value ──▶ rendered resume ──▶ export
```

1. **PDF → HTML** (`lib/pdf-to-html.ts`): `pdfjs-dist` extracts every text run with its
   page position and font size. The converter reconstructs *semantic, flowing* HTML
   (headings, two-column entry rows, bullet lists, key/value rows) from that geometry,
   keeping every `{{KEY}}` token intact. It does **not** hard-code field names, so it
   generalises to resumes with the same visual structure.
2. **Fill** (`lib/template.ts`): each `{{KEY}}` is replaced with the HTML-escaped value
   from the selected user's `data` JSONB.
3. **Render & export** (`app/components/ResumeCloner.tsx`): the filled HTML is previewed
   with a shared stylesheet (`lib/resume-css.ts`); **Export PDF** prints just the resume,
   **Download HTML** saves a self-contained document.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- Neon serverless Postgres (`@neondatabase/serverless`)
- `pdfjs-dist` for PDF text extraction
- Tailwind CSS v4

## Database

Two tables (created/seeded by the setup script):

- `users` — `id, full_name, job_title, email, data (JSONB)` — `data` maps every template
  key to its value. Seeded with 5 distinct candidates.
- `templates` — `id, name, html, keys (JSONB)` — converted templates; the most recent is
  the active one.

`DATABASE_URL` is read from `.env.local`.

## Getting started

```bash
npm install

# Create the schema, convert the sample template PDF, and seed 5 users.
# Optionally pass a path to your own template PDF:
npm run setup            # uses C:/Users/Lenovo/Downloads/resume_template.pdf
# npm run setup -- ./path/to/template.pdf

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You can also replace the template at runtime from the sidebar (**Replace template**),
which `POST`s the PDF to `/api/template`, re-converts it, and stores it.

## API

- `GET /api/users` — all users with their resume data.
- `GET /api/template` — the active (most recent) converted template.
- `POST /api/template` — multipart upload of a PDF (`file` field); converts and stores it.
