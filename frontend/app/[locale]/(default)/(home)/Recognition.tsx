import { AwardIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Recognition() {
  const t = useTranslations("Recognition");
  return (
    <section className="py-16 bg-navy-deep text-cream">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h3 className="mt-3 font-serif text-2xl md:text-3xl text-cream">
            {t("title")}
          </h3>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
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
              className="flex items-center justify-center gap-2 border border-cream/15 py-6 px-4 hover:border-gold/60 transition-colors"
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
