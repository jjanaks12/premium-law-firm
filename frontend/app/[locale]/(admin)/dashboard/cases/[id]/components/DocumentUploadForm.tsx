import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";

export default function DocumentUploadForm({
  caseId,
  refresh,
  onClose,
}: {
  caseId: string;
  refresh: () => void;
  onClose: () => void;
}) {
  const { axios } = useAxios();
  const t = useTranslations("DocumentsTab");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.add({
        title: t("validationErrorTitle"),
        description: t("validationErrorDesc"),
        type: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        files.map((f) => {
          const formData = new FormData();
          formData.append("file", f);
          if (documentType) {
            formData.append("documentType", documentType);
          }
          return axios.post(`/cases/${caseId}/documents`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }),
      );
      toast.add({ title: t("uploadSuccess"), type: "success" });
      refresh();
      onClose();
    } catch (error: any) {
      toast.add({
        title: t("errorTitle"),
        description: error.response?.data?.message || t("unknownError"),
        type: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>
          {t("fileLabel")} <span className="text-destructive">*</span>
        </Label>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          required
          multiple
        />
      </div>
      <div className="space-y-2">
        <Label>Document Type</Label>
        <Input
          type="text"
          placeholder="e.g. Citizenship, Passport, Contract"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="destructive"
          className="mr-2"
          onClick={onClose}
        >
          {t("cancelBtn")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("uploadingStatus") : t("uploadBtn")}
        </Button>
      </div>
    </form>
  );
}
