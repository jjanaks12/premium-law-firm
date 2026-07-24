"use client";

import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import { useTranslations } from "next-intl";
import { AlertTriangleIcon, EyeClosedIcon, EyeIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAxios } from "@/lib/services/axios.service";
import { Link, useRouter } from "@/src/i18n/routing";
import { LoginInput, loginSchema } from "@app/validations";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function LoginForm({ className }: { className?: string }) {
  const { axios } = useAxios();
  const router = useRouter();
  const t = useTranslations("LoginForm");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: LoginInput, { setSubmitting }: any) => {
    try {
      const {
        status,
        data: { data },
      } = await axios.post("/auth/login", values);
      if (status == 200) {
        console.log(data);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        router.push("/dashboard");
      }
    } catch (error: any) {
      setErrorMsg(typeof error === "string" ? error : error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<LoginInput>
      initialValues={{ email: "", password: "", remember: false }}
      onSubmit={handleSubmit}
      validationSchema={loginSchema}
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
                  <InputGroup
                    className={cn(
                      "rounded-xl",
                      touched.password &&
                        errors.password &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  >
                    <InputGroupInput
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <InputGroupAddon
                      align="inline-end"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
                    </InputGroupAddon>
                  </InputGroup>
                )}
              </Field>
              <ErrorMessage
                name="password"
                component="span"
                className="text-sm font-medium text-destructive"
              />
            </div>

            <div className="flex items-center justify-between">
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
              <Link
                href="/forgot-password"
                className="text-sm underline font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 hover:text-navy-deep"
              >
                Forgot password
              </Link>
            </div>
          </div>

          <div className="flex items-between justify-between gap-3">
            {errorMsg && (
              <span className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                <AlertTriangleIcon className="size-4" />
                {errorMsg}
              </span>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="rounded-xl ml-auto"
            >
              {isSubmitting ? t("signing_in") : t("sign_in")}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
