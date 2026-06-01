/** A map of template placeholder keys (without braces) to their string values. */
export type ResumeData = Record<string, string>;

/** A seeded user whose details fill the resume template. */
export interface User {
  id: number;
  full_name: string;
  job_title: string | null;
  email: string | null;
  data: ResumeData;
}

/** A converted resume template stored in the database. */
export interface Template {
  id: number;
  name: string;
  html: string;
  keys: string[];
  created_at: string;
}
