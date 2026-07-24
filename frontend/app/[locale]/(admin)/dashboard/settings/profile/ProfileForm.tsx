"use client";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "@/lib/context/AuthContext";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2Icon, UserIcon } from "lucide-react";
import { updateProfileSchema, UpdateProfileInput } from "@app/validations";

export default function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const { axios } = useAxios();
  const [errorMsg, setErrorMsg] = useState("");

  if (!user) return null;

  const initialValues: UpdateProfileInput = {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
  };

  const handleSubmit = async (
    values: UpdateProfileInput,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void }
  ) => {
    setErrorMsg("");
    try {
      const response = await axios.put("/auth/me", values);
      if (response.status === 200) {
        toast.add({
          title: "Profile Updated",
          description: "Your personal details have been updated successfully.",
          type: "success",
        });
        await refreshUser();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Something went wrong";
      setErrorMsg(message);
      toast.add({
        title: "Update Failed",
        description: message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<UpdateProfileInput>
      initialValues={initialValues}
      validationSchema={updateProfileSchema}
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
              <UserIcon className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user.first_name} {user.last_name}</h3>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Field
                as={Input}
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                className={touched.first_name && errors.first_name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMessage
                name="first_name"
                component="div"
                className="text-destructive text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Field
                as={Input}
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                className={touched.last_name && errors.last_name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMessage
                name="last_name"
                component="div"
                className="text-destructive text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted/50 cursor-not-allowed opacity-80"
            />
            <p className="text-muted-foreground text-xs">
              Email addresses are managed by your administrator and cannot be changed here.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
