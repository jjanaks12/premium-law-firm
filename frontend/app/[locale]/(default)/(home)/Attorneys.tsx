import { LinkedinIcon } from "@/components/Icon";
import { useTranslations } from "next-intl";

const attorneys = [
  {
    img: "/images/attorney-1.jpg",
    name: "वरिष्ट अधिवक्ता सीताराम के.सी",
    title: "अधिवक्ता कुमार भट्ट",
    spec: "अधिवक्ता सम्झना के.सी",
  },
  {
    img: "/images/attorney-2.jpg",
    name: "अधिवक्ता मेनुका सुवेदि",
    title: "Senior Partner",
    spec: "Civil & Commercial Litigation",
  },
  {
    img: "/images/attorney-3.jpg",
    name: "अधिवक्ता सुदिप कुमार साह",
    title: "Partner",
    spec: "Intellectual Property & Tech",
  },
  {
    img: "/images/attorney-4.jpg",
    name: "अधिवक्ता सदिक्षा अधिकारी",
    title: "Partner",
    spec: "Criminal Defence & Human Rights",
  },
];

export default function Attorneys() {
  const t = useTranslations("Attorneys");
  return (
    <section id="attorneys" className="section-space scroll-mt-20 bg-secondary/80">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="mt-4 text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.05] text-navy-deep text-balance">
              {t("title")}
            </h2>
            <span className="gold-rule mt-6" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {attorneys.map((a) => (
            <article key={a.name} className="group overflow-hidden rounded-lg border border-border/80 bg-card shadow-[0_18px_50px_-40px_rgba(14,25,44,0.65)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_-35px_rgba(14,25,44,0.55)]">
              <div className="relative overflow-hidden aspect-4/5 bg-navy-deep">
                <img
                  src={a.img}
                  alt={a.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-deep/45 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-25" />
                <a
                  href="#"
                  aria-label={`${a.name} on LinkedIn`}
                  className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-md bg-gold text-navy-deep opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-serif text-xl text-navy-deep">{a.name}</h3>
                <div className="mt-1 text-xs tracking-[0.2em] uppercase text-gold">
                  {a.title}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {a.spec}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
