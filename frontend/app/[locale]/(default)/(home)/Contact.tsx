import { CheckCircle2Icon, MailIcon, PhoneIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Contact() {
  const t = useTranslations("Contact");
  return (
    <section
      id="contact"
      className="relative section-space scroll-mt-20 bg-navy text-cream overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-gold) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-gold) 0, transparent 40%)",
        }}
      />
      <div className="container-x relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:items-center">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 max-w-2xl font-serif text-[clamp(2.5rem,5vw,3.5rem)] text-cream leading-[1.05] text-balance">
            {t("title")}
          </h2>
          <p className="mt-6 text-cream/70 max-w-lg leading-relaxed">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <a href="tel:+97714441122" className="btn-gold w-full sm:w-auto">
              <PhoneIcon className="h-4 w-4" /> +977 1 444 1122
            </a>
            <a
              href="mailto:chambers@premiumlaw.com.np"
              className="btn-outline-cream w-full sm:w-auto"
            >
              <MailIcon className="h-4 w-4" /> {t("email")}
            </a>
          </div>
        </div>
        <ul className="space-y-3 rounded-lg border border-cream/10 bg-white/[0.035] p-6 backdrop-blur-sm sm:p-8">
          {(t.raw("features") as string[]).map((f) => (
            <li key={f} className="flex items-start gap-3 border-b border-cream/10 pb-4 text-cream/90 last:border-0 last:pb-0">
              <CheckCircle2Icon
                className="h-5 w-5 text-gold shrink-0 mt-0.5"
                strokeWidth={1.5}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
