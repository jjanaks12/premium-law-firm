import { CheckCircle2Icon, MailIcon, PhoneIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Contact() {
  const t = useTranslations("Contact");
  return (
    <section
      id="contact"
      className="relative py-24 md:py-28 bg-navy text-cream overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-gold) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-gold) 0, transparent 40%)",
        }}
      />
      <div className="container-x relative grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-cream leading-[1.1]">
            {t("title")}
          </h2>
          <p className="mt-6 text-cream/70 max-w-lg leading-relaxed">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="tel:+97714441122" className="btn-gold">
              <PhoneIcon className="h-4 w-4" /> +977 1 444 1122
            </a>
            <a
              href="mailto:chambers@premiumlaw.com.np"
              className="btn-outline-cream"
            >
              <MailIcon className="h-4 w-4" /> {t("email")}
            </a>
          </div>
        </div>
        <ul className="space-y-5 lg:pl-10 lg:border-l border-cream/15">
          {(t.raw("features") as string[]).map((f) => (
            <li key={f} className="flex items-start gap-3 text-cream/90">
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
