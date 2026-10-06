import { AwardIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Recognition() {
  const t = useTranslations("Recognition");
  return (
    <section className="border-y border-white/5 bg-navy-deep py-14 text-cream sm:py-16">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h3 className="mt-3 font-serif text-2xl md:text-3xl text-cream">
            {t("title")}
          </h3>
        </div>
        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {[
            "Nepal Bar Association",
            "Supreme Court Bar",
            "SAARCLAW",
            "Chambers Asia-Pacific",
            "Legal 500 Asia",
            "asialaw Profiles",
          ].map((a) => (
            <div
              key={a}
              className="flex min-h-24 min-w-[12rem] snap-start items-center justify-center gap-2 rounded-md border border-cream/10 bg-white/[0.025] px-4 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/45 hover:bg-white/[0.05] sm:min-w-0"
            >
              <AwardIcon
                className="h-5 w-5 text-gold shrink-0"
                strokeWidth={1.5}
              />
              <span className="font-serif text-sm tracking-wide text-cream/90 text-center">
                {a}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
