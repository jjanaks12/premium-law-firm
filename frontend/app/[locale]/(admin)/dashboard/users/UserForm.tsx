"use client";

import React from "react";
import { Formik, Form, Field, FieldProps, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { userInviteSchema, UserInviteInput } from "@app/validations";
import { useTranslations } from "next-intl";
import * as yup from "yup";

interface RoleOption {
  id: string;
  name: string;
}

interface UserFormProps {
  initialData?: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
  isEditing: boolean;
  rolesList: RoleOption[];
}

export default function UserForm({
  initialData,
  onSuccess,
  onCancel,
  isEditing,
  rolesList,
}: UserFormProps) {
  const { axios } = useAxios();
  const t = useTranslations("UsersPage");

  // Dynamic validation schema for editing (email is read-only and password is set, so only name and role are required)
  const validationSchema = isEditing
    ? yup.object({
        first_name: yup.string().trim().required(t("firstName") + " is required"),
        last_name: yup.string().trim().required(t("lastName") + " is required"),
        role_id: yup.string().required(t("selectRole") + " is required"),
      })
    : userInviteSchema;

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
  ) => {
    try {
      if (isEditing && initialData?.id) {
        // Edit User details (First Name, Last Name, Role)
        const { data } = await axios.put(`/users/${initialData.id}`, {
          first_name: values.first_name,
          last_name: values.last_name,
          role_id: values.role_id,
        });

        if (data.success) {
          toast.add({
            title: "Success",
            description: "User details updated successfully",
            type: "success",
          });
          onSuccess();
        }
      } else {
        // Invite new user
        const { data } = await axios.post("/users/invite", values);
        if (data.success) {
          toast.add({
            title: "Success",
            description: t("successInviteToast") || "Invitation email sent successfully",
            type: "success",
          });
          onSuccess();
        }
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.response?.data?.message || err.message || "Action failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    email: initialData?.email || "",
    role_id: initialData?.role_id || "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
      }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">{t("firstName")}</Label>
              <Input
                id="first-name"
                name="first_name"
                value={values.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.first_name && errors.first_name ? "border-destructive" : ""
                }
              />
              {touched.first_name && errors.first_name && (
                <p className="text-xs font-semibold text-destructive">
                  {errors.first_name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">{t("lastName")}</Label>
              <Input
                id="last-name"
                name="last_name"
                value={values.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.last_name && errors.last_name ? "border-destructive" : ""
                }
              />
              {touched.last_name && errors.last_name && (
                <p className="text-xs font-semibold text-destructive">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-address">{t("emailAddress")}</Label>
            <Input
              id="email-address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isEditing}
              placeholder="e.g. staff@premiumlaw.com"
              className={
                touched.email && errors.email ? "border-destructive" : ""
              }
            />
            {touched.email && errors.email && (
              <p className="text-xs font-semibold text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-select">{t("selectRole")}</Label>
            <Field name="role_id">
              {({ field }: FieldProps) => (
                <select
                  {...field}
                  id="role-select"
                  className={`w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    touched.role_id && errors.role_id ? "border-destructive" : ""
                  }`}
                >
                  <option value="">-- {t("selectRole")} --</option>
                  {rolesList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            {touched.role_id && errors.role_id && (
              <p className="text-xs font-semibold text-destructive">
                {errors.role_id}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? t("submitUpdate") : t("submitInvite")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
