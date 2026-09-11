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
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
        <CardTitle>{t("title")}</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm" className="rounded-full">
          <PlusIcon className="w-4 h-4 mr-2" /> {t("uploadDocBtn")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.documents && caseData.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.documents.map((d: any) => (
              <div
                key={d.id}
                className="p-4 border rounded-2xl bg-card hover:shadow-md transition-all flex justify-between items-start group"
              >
                <div className="flex space-x-4 items-start grow">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="grow overflow-hidden">
                    <div className="font-semibold text-base truncate pr-2" title={d.fileName}>{d.fileName}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      {t("uploadedLabel")} <span className="font-medium ml-1 text-foreground">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    {d.description && (
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={process.env.NEXT_PUBLIC_API_URL + d.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "icon" }),
                      "rounded-full h-8 w-8 text-primary hover:text-primary"
                    )}
                    title={t("downloadBtn")}
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => handleDeleteClick(d.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-2xl bg-muted/5">
            <div className="bg-muted p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("noDocuments")}</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              Keep all case-related files in one place. Upload images, PDFs, or Word documents.
            </p>
            <Button onClick={() => setOpen(true)} variant="secondary" className="rounded-full">
              {t("uploadDocBtn")}
            </Button>
          </div>
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
