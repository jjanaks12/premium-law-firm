"use client";

import { Link } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Brand from "@/components/Brand";
import Language from "@/components/Language";
import { useNavLink } from "@/lib/dictionary/defaultNav";
import { usePathname } from "@/src/i18n/routing";

export default function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");
  const { navLinks } = useNavLink();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-navy-deep/90 backdrop-blur-xl border-b border-white/10 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.9)]">
      <div className="container-x flex items-center justify-between h-18 md:h-20">
        <Brand />
        <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Primary navigation">
          {navLinks.map((l, i) => (
            <Link
              key={i}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`relative py-2 text-sm transition-colors tracking-wide after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-gold after:transition-transform focus-visible:outline-none focus-visible:text-gold ${pathname === l.href ? "text-cream after:scale-x-100" : "text-cream/75 after:scale-x-0 hover:text-cream hover:after:scale-x-100"}`}
            >
              {l.key}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Language />
          <Link href="/contact" className="hidden lg:inline-flex btn-gold">
            {t("bookConsultation")}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="lg:hidden size-11 text-cream hover:bg-white/10 hover:text-gold"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div id="mobile-navigation" className="fixed inset-x-0 top-18 bottom-0 lg:hidden bg-navy-deep/98 border-t border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="container-x py-6 flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`rounded-md px-3 py-3 transition-colors ${pathname === l.href ? "bg-white/5 text-gold" : "text-cream/90 hover:bg-white/5 hover:text-gold"}`}
              >
                {l.key}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-gold mt-2"
            >
              {t("bookConsultation")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
