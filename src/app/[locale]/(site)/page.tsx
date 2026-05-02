import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-600">
          BP Holding
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-brand-700 md:text-6xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 text-lg text-neutral-700">{t("heroSubtitle")}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/rfq"
            className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t("ctaQuote")}
          </Link>
          <Link
            href="/about"
            className="rounded-md border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            {t("ctaProfile")}
          </Link>
        </div>
      </div>
    </section>
  );
}
