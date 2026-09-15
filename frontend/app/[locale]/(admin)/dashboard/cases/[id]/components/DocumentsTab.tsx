import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusIcon, Trash2Icon, DownloadIcon, SearchIcon, EyeIcon, ImageIcon, FileTextIcon } from "lucide-react";
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
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Link } from "@/src/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import DocumentUploadForm from "./DocumentUploadForm";

const isImage = (filename: string) => /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(filename || "");
const isPdf = (filename: string) => /\.pdf$/i.test(filename || "");
const canViewInBrowser = (filename: string) => isImage(filename) || isPdf(filename);

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");

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

  const filteredDocuments = caseData.documents?.filter((d: any) => {
    if (!filterType.trim()) return true;
    const search = filterType.toLowerCase();
    const type = d.documentType?.toLowerCase() || "";
    return type.includes(search);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
        <CardTitle>{t("title")}</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm" className="rounded-full">
          <PlusIcon className="w-4 h-4 mr-2" /> {t("uploadDocBtn")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.documents && caseData.documents.length > 0 && (
          <div className="mb-6 max-w-sm relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <SearchIcon className="w-4 h-4" />
            </div>
            <Input
              type="text"
              placeholder="Filter by document type..."
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((d: any) => {
              const viewable = canViewInBrowser(d.fileName);
              return (
                <div
                  key={d.id}
                  className="p-4 border rounded-2xl bg-card hover:shadow-md transition-all flex justify-between items-start group"
                >
                  <div className="flex space-x-4 items-start grow">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0 mt-1">
                      {isImage(d.fileName) ? (
                        <ImageIcon className="w-6 h-6" />
                      ) : (
                        <FileTextIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="grow overflow-hidden">
                      <div className="font-semibold text-base truncate pr-2" title={d.fileName}>{d.fileName}</div>
                      {d.documentType && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {d.documentType}
                          </span>
                        </div>
                      )}
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
                      title={viewable ? "View" : t("downloadBtn")}
                    >
                      {viewable ? <EyeIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
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
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-2xl bg-muted/5">
            <div className="bg-muted p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {filterType ? "No matching documents" : t("noDocuments")}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm">
              {filterType ? "Try adjusting your filter" : "Keep all case-related files in one place. Upload images, PDFs, or Word documents."}
            </p>
            {!filterType && (
              <Button onClick={() => setOpen(true)} variant="secondary" className="rounded-full">
                {t("uploadDocBtn")}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("uploadDialogTitle")}</DialogTitle>
          </DialogHeader>
          <DocumentUploadForm caseId={caseData.id} refresh={refresh} onClose={() => setOpen(false)} />
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
