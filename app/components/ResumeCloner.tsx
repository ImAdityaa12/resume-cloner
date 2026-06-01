"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Template, User } from "@/lib/types";
import { fillTemplate } from "@/lib/template";
import { RESUME_CSS } from "@/lib/resume-css";
import { buildStandaloneHtml } from "@/lib/export-doc";

const AVATAR_COLORS = ["#2f5496", "#0e7c66", "#9333ea", "#c2410c", "#0369a1"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function ResumeCloner({ users, template }: { users: User[]; template: Template | null }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(users[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedUser = users.find((u) => u.id === selectedId) ?? users[0] ?? null;

  const filledHtml = useMemo(() => {
    if (!template || !selectedUser) return "";
    return fillTemplate(template.html, selectedUser.data);
  }, [template, selectedUser]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file
    if (!file) return;

    setUploading(true);
    setNotice(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/template", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setNotice({ kind: "ok", text: `Converted “${json.name}” — ${json.keys.length} fields detected.` });
      router.refresh();
    } catch (err) {
      setNotice({ kind: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  function handleDownloadHtml() {
    if (!selectedUser) return;
    const doc = buildStandaloneHtml(`${selectedUser.full_name} — Resume`, filledHtml);
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedUser.full_name.replace(/\s+/g, "_")}_resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportPdf() {
    // Print only the resume (the print stylesheet hides the rest of the app chrome).
    window.print();
  }

  return (
    <div className="flex h-dvh flex-col bg-[#f4f5f7] text-[#18181b]">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e6e8ec] bg-white px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open candidates menu"
            className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#52525b] transition-colors hover:bg-[#f4f5f7] lg:hidden"
          >
            <MenuIcon />
          </button>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#2f5496] text-[13px] font-bold text-white">
            R
          </div>
          <span className="truncate text-[15px] font-semibold tracking-tight">Resume Cloner</span>
          <span className="ml-1 hidden shrink-0 rounded-full bg-[#eef2fb] px-2 py-0.5 text-[11px] font-medium text-[#2f5496] sm:inline-block">
            Neon Postgres
          </span>
        </div>
        <div className="hidden items-center gap-1.5 text-[12px] text-[#71717a] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {users.length} candidates · {template ? `${template.keys.length} template fields` : "no template"}
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Backdrop (mobile only, when drawer is open) */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}

        {/* Sidebar — off-canvas drawer on mobile, static column on desktop */}
        <aside
          className={`absolute inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] shrink-0 flex-col border-r border-[#e6e8ec] bg-white transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">Candidates</h2>
            <span className="text-[11px] tabular-nums text-[#a1a1aa]">{users.length}</span>
          </div>

          <div className="r-scroll flex-1 overflow-y-auto px-3 pb-3">
            {users.map((u, i) => {
              const active = u.id === selectedId;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedId(u.id);
                    setSidebarOpen(false);
                  }}
                  className={`group mb-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                    active ? "bg-[#eef2fb] ring-1 ring-[#2f5496]/20" : "hover:bg-[#f4f5f7]"
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {initials(u.full_name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13.5px] font-semibold ${active ? "text-[#2f5496]" : "text-[#18181b]"}`}>
                      {u.full_name}
                    </span>
                    <span className="block truncate text-[12px] text-[#71717a]">{u.job_title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Template panel */}
          <div className="border-t border-[#e6e8ec] p-4">
            <div className="rounded-lg border border-[#e6e8ec] bg-[#fafafa] p-3">
              <div className="flex items-center gap-2">
                <PdfIcon />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-[#18181b]">
                    {template?.name ?? "No template"}
                  </div>
                  <div className="text-[11px] text-[#71717a]">
                    {template ? `${template.keys.length} placeholder fields` : "Upload a sample PDF"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#e6e8ec] bg-white px-3 py-2 text-[12.5px] font-medium text-[#18181b] transition-colors hover:bg-[#f4f5f7] disabled:opacity-60"
              >
                {uploading ? <Spinner /> : <UploadIcon />}
                {uploading ? "Converting…" : template ? "Replace template" : "Upload template PDF"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {notice && (
                <p
                  className={`mt-2 text-[11.5px] leading-snug ${
                    notice.kind === "ok" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {notice.text}
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Preview pane */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#e6e8ec] bg-white/70 px-4 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold tracking-tight">
                {selectedUser ? selectedUser.full_name : "—"}
              </div>
              <div className="truncate text-[12px] text-[#71717a]">{selectedUser?.job_title}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleDownloadHtml}
                disabled={!template || !selectedUser}
                aria-label="Download HTML"
                className="flex items-center gap-1.5 rounded-md border border-[#e6e8ec] bg-white px-3 py-2 text-[12.5px] font-medium text-[#18181b] transition-colors hover:bg-[#f4f5f7] disabled:opacity-50"
              >
                <CodeIcon />
                <span className="hidden sm:inline">Download HTML</span>
              </button>
              <button
                onClick={handleExportPdf}
                disabled={!template || !selectedUser}
                aria-label="Export PDF"
                className="flex items-center gap-1.5 rounded-md bg-[#18181b] px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                <DownloadIcon />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>

          <div className="r-scroll flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {/* Inject the canonical resume stylesheet once. */}
            <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} />
            {template && selectedUser ? (
              <div className="print-area mx-auto w-full max-w-[816px] rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.18)]">
                <div dangerouslySetInnerHTML={{ __html: filledHtml }} />
              </div>
            ) : (
              <EmptyState onUpload={() => fileInputRef.current?.click()} hasTemplate={!!template} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function EmptyState({ onUpload, hasTemplate }: { onUpload: () => void; hasTemplate: boolean }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center pt-16 text-center sm:pt-24">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2fb]">
        <PdfIcon />
      </div>
      <h3 className="text-[15px] font-semibold">{hasTemplate ? "Select a candidate" : "No template yet"}</h3>
      <p className="mt-1 text-[13px] text-[#71717a]">
        {hasTemplate
          ? "Pick a candidate from the left to preview their resume."
          : "Upload a sample resume PDF with {{PLACEHOLDER}} fields to get started."}
      </p>
      {!hasTemplate && (
        <button
          onClick={onUpload}
          className="mt-4 rounded-md bg-[#18181b] px-4 py-2 text-[13px] font-semibold text-white hover:bg-black"
        >
          Upload template PDF
        </button>
      )}
    </div>
  );
}

/* ---- icons (inline, no dependency) ---- */
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f5496" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
