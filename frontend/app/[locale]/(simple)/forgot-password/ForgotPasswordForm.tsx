"use client";

import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ForgotPasswordInput, forgotPasswordSchema } from "@app/validations";

export default function ForgotPasswordForm({
  className,
}: {
  className: string;
}) {
  const [errorMsg, setErrorMsg] = useState("");
  const t = useTranslations("ForgotPasswordPage");

  const handleSubmit = async (
    values: ForgotPasswordInput,
    { setSubmitting }: any,
  ) => {
    try {
    } catch (error: any) {
      setErrorMsg(typeof error === "string" ? error : error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<ForgotPasswordInput>
      initialValues={{ email: "" }}
      onSubmit={handleSubmit}
      validationSchema={forgotPasswordSchema}
    >
      {({ isSubmitting, errors, touched, setFieldValue, values }) => (
        <Form className={cn("space-y-6", className)}>
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
          <div className="flex items-center justify-between gap-3">
            {errorMsg && (
              <span className="text-sm font-medium text-destructive">
                {errorMsg}
              </span>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl"
            >
              {isSubmitting && <LoaderIcon className="animate-spin" />}
              {t("btn")}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
