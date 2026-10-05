import { useTranslations } from "next-intl";

export default function Info() {
  const t = useTranslations("Info");

  return (
    <section id="about" className="section-space scroll-mt-20 bg-background">
      <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:items-start">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 max-w-xl text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.05] text-navy-deep text-balance">
            {t.rich("title", {
              highlight: (chunks) => (
                <span className="text-gold">{chunks}</span>
              ),
            })}
          </h2>
          <span className="gold-rule mt-6" />
        </div>
        <div className="space-y-5 border-l-2 border-gold/35 pl-6 text-base leading-8 text-muted-foreground sm:pl-8">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>
            {t.rich("p3", {
              em: (chunks) => <em>{chunks}</em>,
            })}
          </p>
        </div>
      </div>

      <div className="container-x mt-14 sm:mt-20">
        <div className="surface-card grid grid-cols-2 overflow-hidden rounded-lg md:grid-cols-4 md:divide-x md:divide-border">
          {[
            { n: t("stats.yearsNum"), l: t("stats.years") },
            { n: t("stats.outcomesNum"), l: t("stats.outcomes") },
            { n: t("stats.mattersNum"), l: t("stats.matters") },
            { n: t("stats.advocatesNum"), l: t("stats.advocates") },
          ].map((s) => (
            <div key={s.l} className="border-b border-border px-4 py-8 text-center even:border-l md:border-b-0 md:px-6 md:py-10">
              <div className="font-serif text-4xl md:text-5xl text-navy">
                {s.n}
              </div>
              <div className="mt-3 text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
