"use client";

import { useMemo } from "react";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAxios } from "@/lib/services/axios.service";
import { useRouter } from "@/src/i18n/routing";

type Values = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginForm({ className }: { className?: string }) {
  const { axios } = useAxios();
  const router = useRouter();
  const t = useTranslations("LoginForm");

  const schema = useMemo(() => {
    return yup.object({
      email: yup.string()
        .required(t("email_required"))
        .email(t("email_invalid")),
      password: yup.string().min(6, t("password_min")).required(),
      remember: yup.boolean().default(false),
    });
  }, [t]);

  const handleSubmit = async (values: Values, { setSubmitting }: any) => {
    try {
      const res = await axios.post("/auth/login", values);
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<Values>
      initialValues={{ email: "", password: "", remember: false }}
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      {({ isSubmitting, errors, touched, setFieldValue, values }) => (
        <Form className={cn("space-y-6", className)}>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className={cn(
                  touched.email && errors.email && "text-destructive",
                )}
              >
                {t("email")}
              </Label>
              <Field name="email">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    autoComplete="email"
                    className={cn(
                      "rounded-xl",
                      touched.email &&
                        errors.email &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="span"
                className="text-sm font-medium text-destructive"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className={cn(
                  touched.password && errors.password && "text-destructive",
                )}
              >
                {t("password")}
              </Label>
              <Field name="password">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      "rounded-xl",
                      touched.password &&
                        errors.password &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                )}
              </Field>
              <ErrorMessage
                name="password"
                component="span"
                className="text-sm font-medium text-destructive"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={values.remember}
                onCheckedChange={(checked) =>
                  setFieldValue("remember", checked)
                }
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("remember_me")}
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl">
            {isSubmitting ? t("signing_in") : t("sign_in")}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
