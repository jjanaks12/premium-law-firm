import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusIcon, Trash2Icon, DownloadIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Link } from "@/src/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function DocumentsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const t = useTranslations("DocumentsTab");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
          return axios.post(`/cases/${caseData.id}/documents`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }),
      );
      toast.add({ title: t("uploadSuccess"), type: "success" });
      setOpen(false);
      refresh();
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/documents/${deleteId}`);
      toast.add({ title: t("deleteSuccess") });
      refresh();
    } catch (e) {
      toast.add({ title: t("errorTitle"), type: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> {t("uploadDocBtn")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.documents && caseData.documents.length > 0 ? (
          <div className="space-y-4">
            {caseData.documents.map((d: any) => (
              <div
                key={d.id}
                className="p-4 border rounded-lg flex justify-between items-start"
              >
                <div className="grow">
                  <div className="font-medium text-lg">{d.fileName}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t("uploadedLabel")} {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                  {d.description && (
                    <div className="mt-2 text-sm">{d.description}</div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <Link
                    href={process.env.NEXT_PUBLIC_API_URL + d.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" /> {t("downloadBtn")}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(d.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noDocuments")}</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("uploadDialogTitle")}</DialogTitle>
          </DialogHeader>
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
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="destructive"
                className="mr-2"
                onClick={() => setOpen(false)}
              >
                {t("cancelBtn")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("uploadingStatus") : t("uploadBtn")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {t("deleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
