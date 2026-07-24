import { cn } from "@/lib/utils";
import { Link } from "@/src/i18n/routing";
import { ScaleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Brand({ className }: { className?: string }) {
  const t = useTranslations("Brand");
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 text-cream", className)}
    >
      <ScaleIcon className="h-6 w-6 text-gold" strokeWidth={1.5} />
      <span className="font-serif text-xl tracking-wide text-cream">
        {t("premium")} <span className="text-gold">{t("law")}</span> {t("firm")}
      </span>
    </Link>
  );
}
