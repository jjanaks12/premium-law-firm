"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldProps, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";
import * as yup from "yup";
import dayjs from "dayjs";
import { CaseData } from "./page";
import { CaseNatureData } from "../case-natures/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaseFormProps {
  caseData?: CaseData;
  onSuccess: () => void;
  onClose: () => void;
  isEditing: boolean;
}

export default function CaseForm({
  caseData,
  onSuccess,
  onClose,
  isEditing,
}: CaseFormProps) {
  const { axios } = useAxios();
  const t = useTranslations("CasesPage");

  const [natures, setNatures] = useState<CaseNatureData[]>([]);
  const [loadingNatures, setLoadingNatures] = useState(true);

  useEffect(() => {
    const fetchNatures = async () => {
      try {
        const { data } = await axios.get("/case-natures");
        if (data.data) {
          setNatures(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch case natures:", err);
      } finally {
        setLoadingNatures(false);
      }
    };
    fetchNatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validationSchema = yup.object({
    caseNumber: yup.string().trim().required("Case Number is required"),
    caseName: yup.string().trim().required("Case Name is required"),
    natureId: yup.string().required("Nature ID is required"),
    registrationDate: yup.date().nullable(),
    facts: yup.string().nullable(),
    status: yup.string().required("Status is required"),
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
  ) => {
    try {
      if (isEditing && caseData?.id) {
        const { data } = await axios.patch(`/cases/${caseData.id}`, values);
        if (data.data) {
          toast.add({
            title: "Success",
            description: "Case updated successfully",
            type: "success",
          });
          onSuccess();
        }
      } else {
        const { data } = await axios.post("/cases", values);
        if (data.data) {
          toast.add({
            title: "Success",
            description: "Case created successfully",
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
    caseNumber: caseData?.caseNumber || "",
    caseName: caseData?.caseName || "",
    natureId: caseData?.natureId || "",
    registrationDate: caseData?.registrationDate
      ? dayjs(caseData.registrationDate).format("YYYY-MM-DD")
      : "",
    facts: caseData?.facts || "",
    status: caseData?.status || "Draft",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseNumber">
                {t("formNumber")} <span className="text-destructive">*</span>
              </Label>
              <Field name="caseNumber">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="caseNumber"
                    placeholder="e.g. 078-CR-1234"
                  />
                )}
              </Field>
              <ErrorMessage
                name="caseNumber"
                component="div"
                className="text-sm text-destructive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseName">
                {t("formName")} <span className="text-destructive">*</span>
              </Label>
              <Field name="caseName">
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    id="caseName"
                    placeholder="e.g. State vs Ram"
                  />
                )}
              </Field>
              <ErrorMessage
                name="caseName"
                component="div"
                className="text-sm text-destructive"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="natureId">
                {t("formNature")} <span className="text-destructive">*</span>
              </Label>
              <Field name="natureId">
                {({ field, form }: FieldProps) => (
                  <Select
                    onValueChange={(value) =>
                      form.setFieldValue(field.name, value)
                    }
                    value={field.value?.toString() || undefined}
                  >
                    <SelectTrigger
                      id="natureId"
                      disabled={loadingNatures}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a case nature">
                        {field.value
                          ? natures.find(
                              (n) =>
                                n.id.toString() === field.value?.toString(),
                            )?.name || "Select a case nature"
                          : "Select a case nature"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {natures.map((nature) => (
                        <SelectItem
                          key={nature.id}
                          value={nature.id.toString()}
                        >
                          {nature.name}{" "}
                          {nature.nepaliName ? `(${nature.nepaliName})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage
                name="natureId"
                component="div"
                className="text-sm text-destructive"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDate">{t("formRegDate")}</Label>
              <Field name="registrationDate">
                {({ field }: FieldProps) => (
                  <Input {...field} id="registrationDate" type="date" />
                )}
              </Field>
              <ErrorMessage
                name="registrationDate"
                component="div"
                className="text-sm text-destructive"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Field name="status">
                {({ field, form }: FieldProps) => (
                  <Select
                    onValueChange={(value) =>
                      form.setFieldValue(field.name, value)
                    }
                    value={field.value}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-sm text-destructive"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facts">{t("formFacts")}</Label>
            <Field name="facts">
              {({ field }: FieldProps) => (
                <Textarea
                  {...field}
                  id="facts"
                  placeholder="Brief description of the facts..."
                  className="min-h-25"
                />
              )}
            </Field>
            <ErrorMessage
              name="facts"
              component="div"
              className="text-sm text-destructive"
            />
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
