import { getUsers, getActiveTemplate } from "@/lib/db";
import ResumeCloner from "./components/ResumeCloner";

// Always read fresh data so a newly uploaded template shows up immediately.
export const dynamic = "force-dynamic";

export default async function Page() {
  const [users, template] = await Promise.all([getUsers(), getActiveTemplate()]);
  return <ResumeCloner users={users} template={template} />;
}
