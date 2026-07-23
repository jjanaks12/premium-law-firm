import { useTranslations } from "next-intl";

export default function Info() {
  const t = useTranslations("Info");

  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container-x grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 text-4xl md:text-5xl leading-[1.1] text-navy-deep">
            {t.rich("title", {
              highlight: (chunks) => (
                <span className="text-gold">{chunks}</span>
              ),
            })}
          </h2>
          <span className="gold-rule mt-6" />
        </div>
        <div className="space-y-5 text-[15px] leading-[1.75] text-muted-foreground">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>
            {t.rich("p3", {
              em: (chunks) => <em>{chunks}</em>,
            })}
          </p>
        </div>
      </div>

      <div className="container-x mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border">
          {[
            { n: t("stats.yearsNum"), l: t("stats.years") },
            { n: t("stats.outcomesNum"), l: t("stats.outcomes") },
            { n: t("stats.mattersNum"), l: t("stats.matters") },
            { n: t("stats.advocatesNum"), l: t("stats.advocates") },
          ].map((s) => (
            <div key={s.l} className="py-10 px-6 text-center">
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
