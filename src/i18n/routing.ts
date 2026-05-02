import { defineRouting } from "next-intl/routing";

/**
 * Bilingual routing configuration for BP Holding.
 * - English (en) is the default locale.
 * - Arabic (ar) is fully supported with RTL layout.
 * - The locale prefix is always present in the URL (`/en/...`, `/ar/...`).
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirection: Record<AppLocale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};
