import { cn } from "@/lib/utils";
import { Link } from "@/src/i18n/routing";
import { ScaleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface BrandProps {
  theme?: "light" | "dark";
  className?: string;
}

export default function Brand({ className, theme = "light" }: BrandProps) {
  const t = useTranslations("Brand");
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2",
        theme === "light" ? "text-cream" : "text-primary",
        className,
      )}
    >
      <ScaleIcon className="text-gold" strokeWidth={1.5} />
      <span
        className={cn(
          "font-serif text-xl tracking-wide",
          theme === "light" ? "text-cream" : "text-primary",
        )}
      >
        {t("premium")} <span className="text-gold">{t("law")}</span> {t("firm")}
      </span>
    </Link>
  );
}
