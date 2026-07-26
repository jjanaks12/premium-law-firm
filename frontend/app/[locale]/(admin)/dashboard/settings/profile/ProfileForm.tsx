"use client";

import React, { useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "@/lib/context/AuthContext";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Loader2Icon,
  UserIcon,
  UploadIcon,
  GlobeIcon,
} from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "@/components/Icon";
import { updateProfileSchema, UpdateProfileInput } from "@app/validations";

export default function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const { axios } = useAxios();
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const detail =
    user.detail && typeof user.detail === "object"
      ? (user.detail as Record<string, any>)
      : {};

  const initialValues = {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    avatar_id: user.avatar_id || "",
    bio: detail.bio || "",
    twitter: detail.twitter || "",
    linkedin: detail.linkedin || "",
    website: detail.website || "",
  };

  const getFileUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const host = apiUrl.replace("/api/v1", "");
    return `${host}${url}`;
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/resources/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          const resource = response.data.data;
          setFieldValue("avatar_id", resource.id);
          setAvatarPreview(getFileUrl(resource.url));
          toast.add({
            title: "Avatar Uploaded",
            description: "Your new avatar has been prepared.",
            type: "success",
          });
        }
      } catch (error: any) {
        toast.add({
          title: "Upload Failed",
          description: error.message || "Failed to upload avatar image",
          type: "error",
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (
    values: any,
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
      const message =
        error.response?.data?.message || error.message || "Something went wrong";
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
    <Formik
      initialValues={initialValues}
      validationSchema={updateProfileSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched, setFieldValue, values }) => (
        <Form className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Avatar Upload Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted/40 rounded-xl border border-border/50">
            <div className="relative size-20 rounded-full border border-border bg-card flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : user.avatar?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getFileUrl(user.avatar.url)}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : (
                <UserIcon className="size-10 text-muted-foreground" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2Icon className="animate-spin size-6 text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-start gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e, setFieldValue)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <UploadIcon className="mr-2 size-4" />
                Upload Photo
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommend square PNG or JPG, max size 5MB.
              </p>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Field
                as={Input}
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                className={
                  touched.first_name && errors.first_name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
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
                className={
                  touched.last_name && errors.last_name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              <ErrorMessage
                name="last_name"
                component="div"
                className="text-destructive text-xs"
              />
            </div>
          </div>

          {/* Email (Disabled) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted/50 cursor-not-allowed opacity-80"
            />
            <p className="text-xs text-muted-foreground">
              Email addresses are managed by your administrator and cannot be changed here.
            </p>
          </div>

          {/* Bio Description */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / About Me</Label>
            <Field
              as={Textarea}
              id="bio"
              name="bio"
              rows={4}
              placeholder="Tell us about yourself, your legal background or specialties..."
              className={
                touched.bio && errors.bio
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            <ErrorMessage
              name="bio"
              component="div"
              className="text-destructive text-xs"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm border-b border-border pb-2">
              Social Profiles & Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GlobeIcon className="size-3.5" />
                  Website
                </Label>
                <InputGroup className="rounded-lg border-input bg-background/50 h-10">
                  <Field
                    as={InputGroupInput}
                    id="website"
                    name="website"
                    placeholder="https://yourwebsite.com"
                    className="text-xs"
                  />
                </InputGroup>
                <ErrorMessage
                  name="website"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <LinkedinIcon className="size-3.5 text-blue-600" />
                  LinkedIn URL
                </Label>
                <InputGroup className="rounded-lg border-input bg-background/50 h-10">
                  <Field
                    as={InputGroupInput}
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="text-xs"
                  />
                </InputGroup>
                <ErrorMessage
                  name="linkedin"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TwitterIcon className="size-3.5 text-sky-500" />
                  Twitter / X URL
                </Label>
                <InputGroup className="rounded-lg border-input bg-background/50 h-10">
                  <Field
                    as={InputGroupInput}
                    id="twitter"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    className="text-xs"
                  />
                </InputGroup>
                <ErrorMessage
                  name="twitter"
                  component="div"
                  className="text-destructive text-xs"
                />
              </div>
            </div>
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
