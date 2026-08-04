"use client";

import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import {
  AlertTriangleIcon,
  LoaderIcon,
  EyeIcon,
  EyeClosedIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useRouter } from "@/src/i18n/routing";

function AcceptInvitationFormContent({ className }: { className: string }) {
  const { axios } = useAxios();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations("AcceptInvitationPage");

  const validationSchema = yup.object({
    password: yup
      .string()
      .min(6, t("passwordMinError"))
      .required(t("passwordRequired")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("passwordsMustMatch"))
      .required(t("confirmPasswordRequired")),
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!token) {
      setErrorMsg(t("missingTokenError"));
      setSubmitting(false);
      return;
    }

    try {
      setErrorMsg("");
      const { status } = await axios.post("/users/accept-invitation", {
        token,
        password: values.password,
      });

      if (status === 200) {
        toast.add({
          title: t("successTitle"),
          description: t("successDescription"),
          type: "success",
        });
        router.replace("/login?redirectUrl=" + encodeURIComponent(pathname));
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message ||
          (typeof error === "string"
            ? error
            : error.message || t("genericError")),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col justify-center min-h-screen", className)}>
      <h2 className="text-3xl font-bold mb-2 text-foreground font-serif">
        {t("formTitle")}
      </h2>
      <p className="text-sm text-muted-foreground mb-8">{t("formSubTitle")}</p>

      {!token && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-sm font-medium">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <span>{t("missingTokenWarning")}</span>
        </div>
      )}

      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, touched, errors }) => (
          <Form className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <div className="relative">
                <Field name="password">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(
                        "rounded-xl pr-10",
                        touched.password &&
                          errors.password &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                  )}
                </Field>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="span"
                className="text-sm font-medium text-destructive"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <div className="relative">
                <Field name="confirmPassword">
                  {({ field }: FieldProps) => (
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(
                        "rounded-xl pr-10",
                        touched.confirmPassword &&
                          errors.confirmPassword &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                  )}
                </Field>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="confirmPassword"
                component="span"
                className="text-sm font-medium text-destructive"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              {errorMsg && (
                <span className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                  <AlertTriangleIcon className="size-4 shrink-0" />
                  {errorMsg}
                </span>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !token}
                size="lg"
                className="rounded-xl ml-auto w-full sm:w-auto"
              >
                {isSubmitting && <LoaderIcon className="animate-spin mr-2" />}
                {t("submitBtn")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default function AcceptInvitationForm({
  className,
}: {
  className: string;
}) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "flex flex-col justify-center items-center min-h-screen",
            className,
          )}
        >
          <LoaderIcon className="animate-spin size-8 text-primary" />
          <span className="text-sm text-muted-foreground mt-2">Loading...</span>
        </div>
      }
    >
      <AcceptInvitationFormContent className={className} />
    </Suspense>
  );
}
