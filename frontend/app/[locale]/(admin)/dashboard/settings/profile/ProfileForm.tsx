"use client";

import React, { useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
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
  PlusIcon,
  Trash2Icon,
  Link2Icon,
  ImageIcon,
} from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "@/components/Icon";
import { updateProfileSchema, UpdateProfileInput } from "@app/validations";
import MediaLibraryDialog from "@/components/MediaLibraryDialog";

export default function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const { axios } = useAxios();
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const detail =
    user.detail && typeof user.detail === "object"
      ? (user.detail as Record<string, any>)
      : {};

  // legacy compatibility + dynamic links
  const initialLinks = Array.isArray(detail.links) ? [...detail.links] : [];

  if (initialLinks.length === 0) {
    if (detail.website)
      initialLinks.push({ label: "Website", url: detail.website });
    if (detail.linkedin)
      initialLinks.push({ label: "LinkedIn", url: detail.linkedin });
    if (detail.twitter)
      initialLinks.push({ label: "Twitter", url: detail.twitter });
  }

  const initialValues = {
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    avatar_id: user.avatar_id || "",
    bio: detail.bio || "",
    twitter: detail.twitter || "",
    linkedin: detail.linkedin || "",
    website: detail.website || "",
    links: initialLinks,
  };

  const getFileUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const host = apiUrl.replace("/api/v1", "");
    return `${host}${url}`;
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
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
    { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
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
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
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
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <UploadIcon className="mr-2 size-4" />
                  Upload Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs"
                  onClick={() => setMediaLibraryOpen(true)}
                  disabled={uploading}
                >
                  <ImageIcon className="mr-2 size-4" />
                  Choose from Library
                </Button>
              </div>
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
              Email addresses are managed by your administrator and cannot be
              changed here.
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

            <FieldArray name="links">
              {({ remove, push }) => (
                <div className="space-y-3">
                  {values.links && values.links.length > 0 ? (
                    values.links.map((link: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-3 items-start md:items-end p-3 bg-muted/20 border border-border/40 rounded-xl"
                      >
                        <div className="space-y-1.5 flex-1 w-full">
                          <Label
                            htmlFor={`links.${index}.label`}
                            className="text-xs text-muted-foreground"
                          >
                            Label
                          </Label>
                          <InputGroup className="rounded-lg border-input bg-background/50 h-9">
                            <Field
                              as={InputGroupInput}
                              id={`links.${index}.label`}
                              name={`links.${index}.label`}
                              placeholder="e.g. Website, LinkedIn, GitHub"
                              className="text-xs"
                            />
                          </InputGroup>
                          <ErrorMessage
                            name={`links.${index}.label`}
                            component="div"
                            className="text-destructive text-xs"
                          />
                        </div>

                        <div className="space-y-1.5 flex-2 w-full">
                          <Label
                            htmlFor={`links.${index}.url`}
                            className="text-xs text-muted-foreground"
                          >
                            URL
                          </Label>
                          <InputGroup className="rounded-lg border-input bg-background/50 h-9">
                            <Field
                              as={InputGroupInput}
                              id={`links.${index}.url`}
                              name={`links.${index}.url`}
                              placeholder="https://example.com/username"
                              className="text-xs"
                            />
                          </InputGroup>
                          <ErrorMessage
                            name={`links.${index}.url`}
                            component="div"
                            className="text-destructive text-xs"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-lg shrink-0 mt-2 md:mt-0"
                          onClick={() => remove(index)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border rounded-xl">
                      <Link2Icon className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No links added yet.
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs rounded-lg"
                    onClick={() => push({ label: "", url: "" })}
                  >
                    <PlusIcon className="mr-2 size-3.5" />
                    Add Custom Link
                  </Button>
                </div>
              )}
            </FieldArray>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>

          <MediaLibraryDialog
            isOpen={mediaLibraryOpen}
            onClose={() => setMediaLibraryOpen(false)}
            onSelect={(url, id) => {
              setFieldValue("avatar_id", id);
              setAvatarPreview(getFileUrl(url));
            }}
            getFileUrl={getFileUrl}
          />
        </Form>
      )}
    </Formik>
  );
}
