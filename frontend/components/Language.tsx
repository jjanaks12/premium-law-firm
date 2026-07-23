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

export default function Language() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="text-cream">
            <GlobeIcon className="mr-2 h-4 w-4" />
            {locale.toUpperCase()}
          </Button>
        }
      />
      <DropdownMenuContent className="bg-navy-deep/95 backdrop-blur border-white/5">
        {availableLanguages
          .filter((lang) => lang.abbr !== locale)
          .map((lang) => (
            <DropdownMenuItem
              key={lang.abbr}
              className="text-sm text-cream/80 hover:text-gold transition-colors tracking-wide cursor-pointer"
              onClick={() => router.replace(pathname, { locale: lang.abbr })}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
