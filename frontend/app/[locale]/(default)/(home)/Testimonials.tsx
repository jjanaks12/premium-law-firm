import { StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const testimonials = [
  {
    quote:
      "Their team walked us through a difficult contractual dispute with calm and unusual clarity. We were treated like partners, not a case file.",
    name: "Rajesh Maharjan",
    case: "Commercial Dispute, Lalitpur",
  },
  {
    quote:
      "The strategy they built for our cross-border acquisition saved the deal and, frankly, saved us from ourselves on more than one occasion.",
    name: "Nisha Thapa",
    case: "Corporate M&A, Kathmandu",
  },
  {
    quote:
      "During the hardest year of my life they were patient, honest and did not hide anything from me. I would recommend them to any family.",
    name: "Sujan Gurung",
    case: "Family Matter, Pokhara",
  },
];

export default function Testimonials() {
  const t = useTranslations("Testimonials");
  return (
    <section className="py-24 md:py-32 bg-navy-deep text-cream">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-cream">
            {t("title")}
          </h2>
          <span className="gold-rule mt-6" />
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="border border-cream/10 p-8 hover:border-gold/50 transition-colors"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className="h-4 w-4 fill-current"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <blockquote className="mt-6 font-serif text-xl leading-snug text-cream/95">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-cream/10 flex items-center gap-4">
                <div className="h-11 w-11 grid place-items-center bg-gold/15 text-gold font-serif text-lg">
                  {t.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm text-cream">{t.name}</div>
                  <div className="text-xs tracking-widest uppercase text-cream/50">
                    {t.case}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
