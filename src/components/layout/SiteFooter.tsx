import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("common");
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-neutral-600">
        <p className="font-medium text-brand-700">{t("brand")}</p>
        <p className="mt-1">{t("tagline")}</p>
        <p className="mt-4 text-xs text-neutral-500">
          © {year} Business Pioneers Holding. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
