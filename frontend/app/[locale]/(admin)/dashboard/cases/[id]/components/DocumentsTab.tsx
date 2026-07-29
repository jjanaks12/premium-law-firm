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
import { Textarea } from "@/components/ui/textarea";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Link } from "@/src/i18n/routing";
import { cn } from "@/lib/utils";

export default function DocumentsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.add({
        title: "Validation Error",
        description: "Please select a file to upload.",
        type: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (fileName) formData.append("fileName", fileName);
      if (description) formData.append("description", description);

      await axios.post(`/cases/${caseData.id}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.add({ title: "Document uploaded successfully" });
      setOpen(false);
      refresh();
      setFileName("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.response?.data?.message || "Unknown error",
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
      toast.add({ title: "Document deleted" });
      refresh();
    } catch (e) {
      toast.add({ title: "Error", type: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Documents</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Upload Document
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
                    Uploaded: {new Date(d.createdAt).toLocaleDateString()}
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
                    <DownloadIcon className="w-4 h-4 mr-2" /> Download
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
          <p className="text-muted-foreground">No documents uploaded.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>
                File <span className="text-destructive">*</span>
              </Label>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>File Name (Optional)</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Will use original file name if empty"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
