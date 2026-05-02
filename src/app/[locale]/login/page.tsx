import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/features/auth/LoginForm";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
};

/**
 * Shared login page for employees and admins.
 * The role stored in `app_metadata.role` decides which portal the user can reach;
 * the `redirect` query parameter is honored when the middleware bounced the user here.
 */
export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { redirect } = await searchParams;
  setRequestLocale(locale);
  return <LoginPageContent redirectTo={redirect} />;
}

function LoginPageContent({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations("auth");
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-700">{t("employeeLogin")}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {t("adminLogin")} — {t("employeeLogin")}
        </p>
        <div className="mt-6">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
