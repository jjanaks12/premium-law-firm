import { Link } from "@/src/i18n/routing";
import { ScaleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Brand() {
  const t = useTranslations("Brand");
  return (
    <Link href="/" className="flex items-center gap-2 text-cream">
      <ScaleIcon className="h-6 w-6 text-gold" strokeWidth={1.5} />
      <span className="font-serif text-xl tracking-wide text-cream">
        {t("premium")} <span className="text-gold">{t("law")}</span> {t("firm")}
      </span>
    </Link>
  );
}
