import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const posts = [
  {
    img: "/images/blog-1.jpg",
    tag: "Legal Updates",
    date: "Shrawan 2083",
    title: "What the New Muluki Civil Code Amendments Mean for Contracts",
    excerpt:
      "Recent revisions quietly reshape how commercial agreements are interpreted in Nepali courts. A practitioner's read.",
  },
  {
    img: "/images/blog-2.jpg",
    tag: "Corporate Law",
    date: "Ashadh 2083",
    title: "Foreign Investment in Nepal: Reading the FITTA Rules Rewrite",
    excerpt:
      "The updated FITTA framework changes the calculus for inbound investors. Where the friction is — and isn't.",
  },
  {
    img: "/images/blog-3.jpg",
    tag: "Practice Notes",
    date: "Jestha 2083",
    title: "Drafting for the Dispute You Hope Never Comes",
    excerpt:
      "The clauses most likely to be tested in Nepali litigation — and the small drafting habits that avoid costly ambiguity.",
  },
];

export default function Insights() {
  const t = useTranslations("Insights");
  return (
    <section id="insights" className="py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="mt-4 text-4xl md:text-5xl text-navy-deep">
              {t("title")}
            </h2>
            <span className="gold-rule mt-6" />
          </div>
          <a
            href="#"
            className="text-sm tracking-[0.2em] uppercase text-navy hover:text-gold transition-colors inline-flex items-center gap-2"
          >
            {t("allArticles")} <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-10">
          {posts.map((p) => (
            <article key={p.title} className="group cursor-pointer">
              <div className="overflow-hidden aspect-4/3 bg-muted">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="pt-6">
                <div className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase">
                  <span className="text-gold">{p.tag}</span>
                  <span className="h-1 w-1 bg-muted-foreground/50 rounded-full" />
                  <span className="text-muted-foreground">{p.date}</span>
                </div>
                <h3 className="mt-4 font-serif text-2xl leading-snug text-navy-deep group-hover:text-navy transition-colors">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {p.excerpt}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-navy group-hover:text-gold transition-colors">
                  {t("readMore")} <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
