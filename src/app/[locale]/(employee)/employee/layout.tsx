import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import type { AppRole } from "@/lib/auth/roles";

/**
 * Employee / HR portal layout (route group `(employee)`).
 * Allows users with the `employee` role (admins are also allowed for support).
 */
export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/employee");
  const role = (user.app_metadata?.role ?? null) as AppRole | null;
  if (role !== "employee" && role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-col border-e border-neutral-200 bg-white p-6 md:flex">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Employee Portal
        </p>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          <Link href="/employee" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Dashboard
          </Link>
          <Link href="/employee/profile" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Profile & Documents
          </Link>
          <Link href="/employee/leaves" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Leave Balance & Requests
          </Link>
          <Link href="/employee/requests" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Administrative Requests
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
