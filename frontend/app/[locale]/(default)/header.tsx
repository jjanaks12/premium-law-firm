"use client";

import { Link } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Brand from "@/components/Brand";
import Language from "@/components/Language";
import { useNavLink } from "@/lib/dictionary/nav";

export default function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");
  const { navLinks } = useNavLink();

  return (
    <header className="bg-navy-deep/95 backdrop-blur border-b border-white/5">
      <div className="container-x flex items-center justify-between h-20">
        <Brand />
        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((l, i) => (
            <Link
              key={i}
              href={l.href}
              className="text-sm text-cream/80 hover:text-gold transition-colors tracking-wide"
            >
              {l.key}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Language />
          <Link href="/contact" className="hidden lg:inline-flex btn-gold">
            {t("bookConsultation")}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="lg:hidden text-cream"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-(--color-navy-deep) border-t border-white/10">
          <div className="container-x py-6 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-cream/90 hover:text-gold py-1"
              >
                {t(l.key as any)}
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
