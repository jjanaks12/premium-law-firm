"use client";

import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "lucide-react";
import { usePathname, useRouter } from "@/src/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const availableLanguages = [
  {
    abbr: "en",
    label: "English",
  },
  {
    abbr: "np",
    label: "नेपाली",
  },
] as const;

export default function Language({
  className,
  theme = "light",
}: {
  className?: string;
  theme?: "dark" | "light";
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label="Language / भाषा"
            className={cn(
              theme === "light" ? "text-cream" : "text-navy",
              className,
            )}
          >
            <GlobeIcon className="mr-2 h-4 w-4" />
            {locale === "en" ? "English" : "नेपाली"}
          </Button>
        }
      />
      <DropdownMenuContent className="bg-cream">
        {availableLanguages
          .filter((lang) => lang.abbr !== locale)
          .map((lang) => (
            <DropdownMenuItem
              key={lang.abbr}
              className="text-sm hover:text-gold transition-colors tracking-wide cursor-pointer"
              lang={lang.abbr === "np" ? "ne" : "en"}
              onClick={() => router.replace(
                `${pathname}${window.location.search}${window.location.hash}`,
                { locale: lang.abbr, scroll: false },
              )}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
