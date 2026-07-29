"use client";

import React from "react";
import { Formik, Form, Field, FieldProps, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";
import * as yup from "yup";
import { CaseNatureData } from "./page";

interface CaseNatureFormProps {
  natureData?: CaseNatureData;
  onSuccess: () => void;
  onClose: () => void;
  isEditing: boolean;
}

export default function CaseNatureForm({
  natureData,
  onSuccess,
  onClose,
  isEditing,
}: CaseNatureFormProps) {
  const { axios } = useAxios();
  const t = useTranslations("CaseNaturesPage");

  const validationSchema = yup.object({
    name: yup.string().trim().required("Name is required"),
    nepaliName: yup.string().trim().nullable(),
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
  ) => {
    try {
      if (isEditing && natureData?.id) {
        const { data } = await axios.patch(`/case-natures/${natureData.id}`, values);
        if (data.data) {
          toast.add({
            title: "Success",
            description: "Case nature updated successfully",
            type: "success",
          });
          onSuccess();
        }
      } else {
        const { data } = await axios.post("/case-natures", values);
        if (data.data) {
          toast.add({
            title: "Success",
            description: "Case nature created successfully",
            type: "success",
          });
          onSuccess();
        }
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Action failed",
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    name: natureData?.name || "",
    nepaliName: natureData?.nepaliName || "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("formName")} <span className="text-destructive">*</span>
              </Label>
              <Field name="name">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g. Criminal"
                  />
                )}
              </Field>
              <ErrorMessage
                name="name"
                component="div"
                className="text-sm text-destructive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nepaliName">
                {t("formNepaliName")}
              </Label>
              <Field name="nepaliName">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="nepaliName"
                    placeholder="e.g. फौजदारी"
                  />
                )}
              </Field>
              <ErrorMessage
                name="nepaliName"
                component="div"
                className="text-sm text-destructive"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? t("submitUpdate") : t("submitAdd")}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
