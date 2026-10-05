import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeroBanner() {
  const t = useTranslations("Hero");
  const info = useTranslations("Info");
  const stats = [
    { value: info("stats.yearsNum"), label: info("stats.years") },
    { value: info("stats.mattersNum"), label: info("stats.matters") },
    { value: info("stats.outcomesNum"), label: info("stats.outcomes") },
  ];

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden after:absolute after:inset-0 after:content-[''] after:bg-linear-to-r after:from-navy-deep/98 after:via-navy-deep/70 after:to-navy-deep/12 before:absolute before:inset-0 before:z-1 before:content-[''] before:bg-linear-to-t before:from-navy-deep/80 before:via-transparent before:to-navy-deep/10">
      <img
        src={"/images/hero-law.jpg"}
        alt="The Supreme Court of Nepal at dusk"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[58%_center]"
        width={1024}
        height={1024}
      />
      <div className="container-x relative z-10 flex min-h-[calc(100svh-4.5rem)] flex-col justify-center py-16 sm:py-20 lg:py-24">
        <div className="max-w-[46rem] lg:max-w-[50rem]">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="mt-5 font-serif text-[clamp(3.25rem,6.4vw,5.85rem)] leading-[0.94] tracking-[-0.045em] text-cream text-balance">
            {t.rich("title", {
              highlight: (chunks) => (
                <span className="block text-gold">{chunks}</span>
              ),
            })}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-cream/78 sm:text-lg sm:leading-8">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <a href="#contact" className="btn-gold w-full sm:w-auto">
              {t("bookConsultation")} <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a href="#practice" className="btn-outline-cream w-full sm:w-auto">
              {t("practiceAreas")}
            </a>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-4 text-[0.68rem] uppercase tracking-[0.2em] text-cream/55 sm:gap-6 sm:text-xs">
            <span>{t("nba")}</span>
            <span className="h-px w-8 bg-gold/50" />
            <span>{t("saarclaw")}</span>
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-md border border-white/15 bg-navy-deep/78 shadow-2xl backdrop-blur-md sm:grid-cols-3 lg:absolute lg:bottom-8 lg:right-10 lg:mt-0 lg:w-[34rem] xl:right-[max(2.5rem,calc((100vw-80rem)/2))]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-b border-white/10 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-6 lg:py-6"
            >
              <div className="font-serif text-3xl text-gold lg:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-[0.62rem] uppercase leading-4 tracking-[0.16em] text-cream/65">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
