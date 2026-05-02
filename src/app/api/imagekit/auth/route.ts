import { NextResponse } from "next/server";
import { generateImageKitUploadAuth } from "@/lib/imagekit/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/roles";

/**
 * Returns short-lived ImageKit upload credentials.
 * Only authenticated admins (CMS uploads) and employees (HR document uploads)
 * are allowed to request a token. Public uploads (e.g. RFQ attachments) must
 * be handled through dedicated server actions that validate the form first.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (user.app_metadata?.role ?? null) as AppRole | null;
  if (role !== "admin" && role !== "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(generateImageKitUploadAuth());
}
