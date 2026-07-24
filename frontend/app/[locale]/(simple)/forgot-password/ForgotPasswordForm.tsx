"use client";

import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { AlertTriangleIcon, LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ForgotPasswordInput, forgotPasswordSchema } from "@app/validations";
import { useAxios } from "@/lib/services/axios.service";

export default function ForgotPasswordForm({
  className,
}: {
  className: string;
}) {
  const { axios } = useAxios();
  const [errorMsg, setErrorMsg] = useState("");
  const t = useTranslations("ForgotPasswordPage");

  const handleSubmit = async (
    values: ForgotPasswordInput,
    { setSubmitting }: any,
  ) => {
    try {
      const { data } = await axios.post("/auth/forgot-password", values);
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
              {isSubmitting && <LoaderIcon className="animate-spin" />}
              {t("btn")}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
