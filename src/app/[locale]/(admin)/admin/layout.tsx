import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import type { AppRole } from "@/lib/auth/roles";

/**
 * Admin Dashboard layout (route group `(admin)`).
 * Middleware already enforces auth + role, but we also re-check on the
 * server here as a defense-in-depth measure before rendering admin UI.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");
  const role = (user.app_metadata?.role ?? null) as AppRole | null;
  if (role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-col border-e border-neutral-200 bg-white p-6 md:flex">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Admin
        </p>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Overview
          </Link>
          <Link href="/admin/projects" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Projects
          </Link>
          <Link href="/admin/rfqs" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            RFQs / Inquiries
          </Link>
          <Link href="/admin/applications" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Applications
          </Link>
          <Link href="/admin/employees" className="rounded-md px-3 py-2 hover:bg-neutral-100">
            Employees / HR
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
