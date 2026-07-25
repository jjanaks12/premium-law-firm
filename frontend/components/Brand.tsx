"use client";

import { cn } from "@/lib/utils";
import { Link } from "@/src/i18n/routing";
import { ScaleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSidebar } from "./ui/sidebar";

interface BrandProps {
  theme?: "light" | "dark";
  className?: string;
  compact?: boolean;
}

export default function Brand({
  className,
  theme = "light",
  compact = false,
}: BrandProps) {
  const t = useTranslations("Brand");
  const { open } = useSidebar();

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2",
        theme === "light" ? "text-cream" : "text-primary",
        className,
      )}
    >
      <ScaleIcon
        className={`text-gold ${!open ? "size-10!" : ""}`}
        strokeWidth={1.5}
      />
      {!compact && (
        <span
          className={cn(
            "font-serif text-xl tracking-wide",
            theme === "light" ? "text-cream" : "text-primary",
          )}
        >
          {t("premium")} <span className="text-gold">{t("law")}</span>{" "}
          {t("firm")}
        </span>
      )}
    </Link>
  );
}
