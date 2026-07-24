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
];

export default function Language({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className={cn("text-cream", className)}>
            <GlobeIcon className="mr-2 h-4 w-4" />
            {locale.toUpperCase()}
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
              onClick={() => router.replace(pathname, { locale: lang.abbr })}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
