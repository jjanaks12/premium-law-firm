import Brand from "@/components/Brand";
import ResetPasswordForm from "./ResetPasswordForm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ResetPasswordPage() {
  const t = await getTranslations("ResetPasswordPage");

  return (
    <section className="flex items-center">
      <ResetPasswordForm className="max-w-[60%] lg:max-w-120 grow ml-auto pr-10" />
      <div className="w-1/2 min-h-screen bg-navy-deep hidden lg:flex flex-col justify-center items-start p-20 space-y-3">
        <Brand />
        <h1 className="text-4xl text-cream/80">{t("title")}</h1>
        <p className="text-cream/60 mb-10">{t("description")}</p>
        <span className="w-full flex items-center gap-2 text-cream/60 before:content-[''] before:h-px before:grow before:bg-cream/50 after:content-[''] after:h-px after:grow after:bg-cream/50">
          OR
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {t("signInInstead")}
          </Link>
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </section>
  );
}
