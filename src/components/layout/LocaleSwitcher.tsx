"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { useTransition } from "react";

/**
 * Toggles between Arabic and English while preserving the current path.
 * Client component because it uses navigation hooks and transitions.
 */
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.replace(pathname, { locale: next });
        });
      }}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
    >
      {t("languageSwitch")}
    </button>
  );
}
