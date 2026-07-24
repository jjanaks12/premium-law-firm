import Brand from "@/components/Brand";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("ForgotPasswordPage");

  return (
    <section className="flex items-center">
      <ForgotPasswordForm className="max-w-[60%] lg:max-w-120 grow ml-auto pr-10" />
      <div className="w-1/2 min-h-screen bg-navy-deep hidden lg:flex flex-col justify-center items-start p-20 space-y-3">
        <Brand />
        <h1 className="text-4xl text-cream/80">{t("title")}</h1>
        <p className="text-cream/60 mb-10">{t("description")}</p>
      </div>
    </section>
  );
}
