import {
  ArrowRightIcon,
  Building2Icon,
  GavelIcon,
  LightbulbIcon,
  ScaleIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

const practiceAreas = [
  {
    icon: Building2Icon,
    title: "Corporate & Business Law",
    desc: "Strategic counsel on mergers, acquisitions, governance, and complex commercial transactions.",
  },
  {
    icon: ShieldIcon,
    title: "Criminal Defense",
    desc: "Vigorous defense at every stage — from investigation through trial and appeal.",
  },
  {
    icon: GavelIcon,
    title: "Civil Litigation",
    desc: "Assertive advocacy in high-stakes disputes, class actions, and appellate matters.",
  },
  {
    icon: UsersIcon,
    title: "Family & Matrimonial Law",
    desc: "Sensitive, discreet representation in divorce, custody, and estate transitions.",
  },
  {
    icon: ScaleIcon,
    title: "Real Estate & Property",
    desc: "End-to-end guidance on acquisitions, development, leasing, and land use.",
  },
  {
    icon: LightbulbIcon,
    title: "Intellectual Property",
    desc: "Protecting innovation through patents, trademarks, licensing, and enforcement.",
  },
];

export default function PracticeAreas() {
  const t = useTranslations("PracticeAreas");
  return (
    <section id="practice" className="section-space scroll-mt-20 bg-secondary/45">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.05] text-navy-deep text-balance">
            {t("title")}
          </h2>
          <span className="gold-rule mt-6" />
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {practiceAreas.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group surface-card rounded-lg p-7 transition-all duration-300 hover:-translate-y-1 hover:border-navy/20 hover:bg-navy-deep hover:shadow-xl sm:p-9"
            >
              <Icon className="h-9 w-9 text-gold" strokeWidth={1.25} />
              <h3 className="mt-6 font-serif text-2xl text-navy-deep group-hover:text-cream transition-colors">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-cream/70 transition-colors">
                {desc}
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold transition-transform group-hover:translate-x-1">
                {t("learnMore")} <ArrowRightIcon className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
