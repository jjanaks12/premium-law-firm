import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeroBanner() {
  const t = useTranslations("Hero");
  return (
    <section className="relative min-h-svh flex items-center overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-linear-to-r after:from-(--color-navy-deep) after:via-navy-deep/85 after:to-navy-deep/40 before:absolute before:inset-0 before:bg-navy-deep/30 before:content-['']">
      <img
        src={"/images/hero-law.jpg"}
        alt="The Supreme Court of Nepal at dusk"
        className="absolute inset-0 h-full w-full object-cover"
        width={1024}
        height={1024}
      />
      <div className="container-x relative z-10 pt-32 pb-24">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-cream">
          {t.rich("title", {
            highlight: (chunks) => (
              <span className="block text-gold">{chunks}</span>
            ),
          })}
        </h1>
        <p className="mt-8 max-w-xl text-lg text-cream/80 leading-relaxed">
          {t("description")}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#contact" className="btn-gold">
            {t("bookConsultation")} <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a href="#practice" className="btn-outline-cream">
            {t("practiceAreas")}
          </a>
        </div>
        <div className="mt-14 flex items-center gap-6 text-cream/50 text-xs tracking-[0.22em] uppercase">
          <span>{t("nba")}</span>
          <span className="h-px w-8 bg-cream/20" />
          <span>{t("saarclaw")}</span>
        </div>
      </div>
    </section>
  );
}
