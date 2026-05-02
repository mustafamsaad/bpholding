import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

/**
 * Public site header used by the (site) route group.
 * Server component — translations are loaded via useTranslations.
 */
export function SiteHeader() {
  const t = useTranslations();

  const navItems = [
    { href: "/", key: "home" },
    { href: "/about", key: "about" },
    { href: "/services", key: "services" },
    { href: "/portfolio", key: "portfolio" },
    { href: "/careers", key: "careers" },
    { href: "/contractors", key: "contractors" },
    { href: "/rfq", key: "rfq" },
    { href: "/contact", key: "contact" },
  ] as const;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-brand-700">
          {t("common.brand")}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-neutral-700 transition-colors hover:text-brand-600"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
