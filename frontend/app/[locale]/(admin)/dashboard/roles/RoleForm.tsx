"use client";

import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";
import { useAxios } from "@/lib/services/axios.service";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "@/components/ui/toast";
import { RoleInput, roleSchema } from "@app/validations";

export interface ResourcePermissionInfo {
  resource: string;
  label: string;
  desc: string;
  actions: string[];
}

interface RoleFormProps {
  formData: RoleInput;
  onSuccess: () => void;
  onCancel: () => void;
  isEditing: boolean;
  editingId: string | null;
  resourcesList: ResourcePermissionInfo[];
}

export default function RoleForm({
  formData,
  onSuccess,
  onCancel,
  isEditing,
  editingId,
  resourcesList,
}: RoleFormProps) {
  const { axios } = useAxios();
  const { refreshUser } = useAuth();

  const isAdminRole = isEditing && (formData.name || "").trim().toLowerCase() === "admin";

  const handleActionToggle = (
    resource: string,
    action: string,
    values: RoleInput,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    if (isAdminRole && resource === "roles") return;
    const key = `${resource}:${action}`;
    const currentPermissions = { ...values.permissions } as Record<string, boolean>;
    currentPermissions[key] = !currentPermissions[key];
    setFieldValue("permissions", currentPermissions);
  };

  const handleSubmit = async (
    values: RoleInput,
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
  ) => {
    try {
      if (isEditing && editingId) {
        const { data } = await axios.put(`/roles/${editingId}`, values);
        if (data.success) {
          toast.add({
            title: "Success",
            description: "Role updated successfully",
            type: "success",
          });
          await refreshUser();
          onSuccess();
        }
      } else {
        const { data } = await axios.post("/roles", values);
        if (data.success) {
          toast.add({
            title: "Success",
            description: "Role created successfully",
            type: "success",
          });
          await refreshUser();
          onSuccess();
        }
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.message || "Failed to save role",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues: RoleInput = {
    name: formData.name,
    description: formData.description,
    permissions: formData.permissions,
  };

  return (
    <Formik<RoleInput>
      initialValues={initialValues}
      validationSchema={roleSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        isSubmitting,
      }) => (
        <Form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Associate Attorney, Paralegal"
              className={
                touched.name && errors.name ? "border-destructive" : ""
              }
            />
            {touched.name && errors.name && (
              <p className="text-xs font-semibold text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Summarize the core duties or access scope"
              rows={3}
              className={
                touched.description && errors.description
                  ? "border-destructive"
                  : ""
              }
            />
            {touched.description && errors.description && (
              <p className="text-xs font-semibold text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <Label>Resource Permission Rules</Label>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Supported Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resourcesList.map((res) => (
                    <tr
                      key={res.resource}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-foreground">
                          {res.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {res.desc}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {res.actions.map((act) => {
                            const key = `${res.resource}:${act}`;
                            const isChecked = !!(values.permissions as Record<string, boolean>)?.[key];
                            const isCheckboxDisabled = isAdminRole && res.resource === "roles";
                            return (
                              <label
                                key={act}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border select-none transition-all text-xs font-medium ${
                                  isCheckboxDisabled
                                    ? "opacity-60 cursor-not-allowed bg-muted/30 border-muted text-muted-foreground"
                                    : "cursor-pointer"
                                } ${
                                  !isCheckboxDisabled && isChecked
                                    ? "bg-primary/5 border-primary/30 text-primary"
                                    : !isCheckboxDisabled
                                    ? "bg-muted/50 border-border text-muted-foreground hover:bg-muted/85"
                                    : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isCheckboxDisabled}
                                  onChange={() =>
                                    handleActionToggle(
                                      res.resource,
                                      act,
                                      values,
                                      setFieldValue,
                                    )
                                  }
                                  className={`h-3 w-3 accent-primary ${isCheckboxDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                />
                                <span>{act}</span>
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update Role" : "Create Role"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
