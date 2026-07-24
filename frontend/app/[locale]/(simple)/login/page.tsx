import Brand from "@/components/Brand";
import LoginForm from "./LoginForm";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("LoginPage");
  return (
    <section className="flex items-center">
      <LoginForm className="max-w-[60%] lg:max-w-120 grow ml-auto pr-10" />
      <div className="w-1/2 min-h-screen bg-navy-deep hidden lg:flex flex-col justify-center items-start p-20 space-y-3">
        <Brand />
        <h1 className="text-4xl text-cream/80">{t("welcome_back")}</h1>
        <p className="text-cream/60 mb-10">{t("sign_in_desc")}</p>
      </div>
    </section>
  );
}
