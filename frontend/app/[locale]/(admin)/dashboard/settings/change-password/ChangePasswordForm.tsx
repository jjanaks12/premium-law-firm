"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "@/lib/context/AuthContext";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2Icon, KeyIcon } from "lucide-react";
import { changePasswordSchema, ChangePasswordInput } from "@app/validations";

export default function ChangePasswordForm() {
  const { user } = useAuth();
  const { axios } = useAxios();
  const [errorMsg, setErrorMsg] = useState("");

  if (!user) return null;

  const initialValues: ChangePasswordInput = {
    old_password: "",
    new_password: "",
  };

  const handleSubmit = async (
    values: ChangePasswordInput,
    { setSubmitting, resetForm }: { setSubmitting: (submitting: boolean) => void; resetForm: () => void }
  ) => {
    setErrorMsg("");
    try {
      const response = await axios.post("/auth/change-password", values);
      if (response.status === 200) {
        toast.add({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
          type: "success",
        });
        resetForm();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Something went wrong";
      setErrorMsg(message);
      toast.add({
        title: "Change Failed",
        description: message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<ChangePasswordInput>
      initialValues={initialValues}
      validationSchema={changePasswordSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-lg border border-border/50">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <KeyIcon className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Security Settings</h3>
              <p className="text-muted-foreground text-xs font-medium">Ensure your new password contains at least 6 characters.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="old_password">Current Password</Label>
            <Field
              as={Input}
              type="password"
              id="old_password"
              name="old_password"
              placeholder="Enter current password"
              className={touched.old_password && errors.old_password ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMessage
              name="old_password"
              component="div"
              className="text-destructive text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Field
              as={Input}
              type="password"
              id="new_password"
              name="new_password"
              placeholder="Enter new password"
              className={touched.new_password && errors.new_password ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <ErrorMessage
              name="new_password"
              component="div"
              className="text-destructive text-xs"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
