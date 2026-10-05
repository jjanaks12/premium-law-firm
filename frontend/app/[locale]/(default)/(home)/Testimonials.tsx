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
    <section className="section-space bg-navy-deep text-cream">
      <div className="container-x">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-cream">
            {t("title")}
          </h2>
          <span className="gold-rule mt-6" />
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3 lg:gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative rounded-lg border border-cream/10 bg-white/[0.025] p-6 transition-all duration-300 before:absolute before:right-6 before:top-2 before:font-serif before:text-7xl before:leading-none before:text-gold/10 before:content-['“'] hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.04] sm:p-8"
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
              <blockquote className="mt-6 font-serif text-xl leading-relaxed text-cream/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-cream/10 flex items-center gap-4">
                <div className="grid size-11 place-items-center rounded-full bg-gold/15 text-gold font-serif text-lg">
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
