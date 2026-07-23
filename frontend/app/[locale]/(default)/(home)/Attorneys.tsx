import { LinkedinIcon } from "@/components/Icon";
import { useTranslations } from "next-intl";

const attorneys = [
  {
    img: "/images/attorney-1.jpg",
    name: "Sr. Adv. Bishnu P. Sharma",
    title: "Managing Partner",
    spec: "Corporate & Constitutional Law",
  },
  {
    img: "/images/attorney-2.jpg",
    name: "Adv. Sabina Rana Magar",
    title: "Senior Partner",
    spec: "Civil & Commercial Litigation",
  },
  {
    img: "/images/attorney-3.jpg",
    name: "Adv. Dipendra Shrestha",
    title: "Partner",
    spec: "Intellectual Property & Tech",
  },
  {
    img: "/images/attorney-4.jpg",
    name: "Adv. Kamala Adhikari",
    title: "Partner",
    spec: "Criminal Defence & Human Rights",
  },
];

export default function Attorneys() {
  const t = useTranslations("Attorneys");
  return (
    <section id="attorneys" className="py-24 md:py-32 bg-secondary">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="mt-4 text-4xl md:text-5xl text-navy-deep">
              {t("title")}
            </h2>
            <span className="gold-rule mt-6" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {attorneys.map((a) => (
            <article key={a.name} className="group">
              <div className="relative overflow-hidden aspect-4/5 bg-navy-deep">
                <img
                  src={a.img}
                  alt={a.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <a
                  href="#"
                  aria-label={`${a.name} on LinkedIn`}
                  className="absolute bottom-4 right-4 h-10 w-10 grid place-items-center bg-gold text-navy-deep opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              </div>
              <div className="pt-6">
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
