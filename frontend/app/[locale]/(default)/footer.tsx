import { Link } from "@/src/i18n/routing";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/Icon";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Brand from "@/components/Brand";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();
  return (
    <footer className="bg-navy-deep text-cream/80">
      <div className="container-x py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Brand />
          <p className="mt-5 text-sm leading-relaxed text-cream/60 max-w-xs">
            {t("Footer.description")}
          </p>
          <div className="mt-6 flex gap-3">
            {[LinkedinIcon, TwitterIcon, FacebookIcon].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="h-9 w-9 grid place-items-center border border-cream/15 hover:border-gold hover:text-gold transition-colors"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-serif text-cream text-lg">
            {t("Footer.quickLinks")}
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: t("Nav.practiceAreas"), href: "#" },
              { label: t("Footer.firmOverview"), href: "#" },
              { label: t("Nav.attorneys"), href: "/team" },
              { label: t("Footer.careers"), href: "#" },
              { label: t("Nav.insights"), href: "#" },
            ].map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="hover:text-gold transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-cream text-lg">
            {t("Footer.contactHeading")}
          </h4>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>
                {t("Footer.address1")}
                <br />
                {t("Footer.address2")}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>+977&nbsp;1&nbsp;444&nbsp;1122</span>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>premiumlaw2022@gmail.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-cream text-lg">
            {t("Footer.officeHours")}
          </h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3">
              <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>{t("Footer.monFri")}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>{t("Footer.saturday")}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <span>{t("Footer.sunday")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x py-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-cream/50">
          <div>{t("Footer.copyright", { year: new Date().getFullYear() })}</div>
          <div className="flex flex-wrap gap-6">
            <Link href="#" className="hover:text-gold">
              {t("Footer.privacyPolicy")}
            </Link>
            <Link href="#" className="hover:text-gold">
              {t("Footer.termsOfService")}
            </Link>
            <Link href="#" className="hover:text-gold">
              {t("Footer.legalDisclaimer")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
