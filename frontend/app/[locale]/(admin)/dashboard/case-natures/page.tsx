"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  FolderCogIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CaseNatureForm from "./CaseNatureForm";

export interface CaseNatureData {
  id: string;
  name: string;
  nepaliName: string | null;
}

export default function CaseNaturesPage() {
  const { axios } = useAxios();
  const t = useTranslations("CaseNaturesPage");

  const [natures, setNatures] = useState<CaseNatureData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");

  // Form Modal States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNature, setSelectedNature] = useState<
    CaseNatureData | undefined
  >(undefined);

  // Delete Dialog States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchNatures = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/case-natures", {
        params: { search },
      });
      if (data.data) {
        setNatures(data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch case natures:", err);
      toast.add({
        title: "Error",
        description: "Failed to fetch case natures.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNatures();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Handlers for Add/Edit Form
  const handleAddClick = () => {
    setSelectedNature(undefined);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditClick = (n: CaseNatureData) => {
    setSelectedNature(n);
    setIsEditing(true);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedNature(undefined);
  };

  const handleFormSuccess = () => {
    closeForm();
    fetchNatures();
  };

  // Handlers for Delete
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/case-natures/${deleteId}`);
      toast.add({
        title: "Success",
        description: "Case nature deleted successfully.",
        type: "success",
      });
      fetchNatures();
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to delete case nature",
        type: "danger",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderCogIcon className="h-6 w-6 text-primary" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddClick}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("addBtn")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md bg-card"
        />
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colNepaliName")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2Icon className="h-8 w-8 animate-spin mb-2" />
                      {t("loading")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : natures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FolderCogIcon className="h-12 w-12 mb-2 text-muted-foreground/50" />
                      <p className="font-medium text-foreground">
                        {t("noNaturesFound")}
                      </p>
                      <p className="text-sm">{t("noNaturesFoundDesc")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                natures.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.name}</TableCell>
                    <TableCell>{n.nepaliName || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(n)}
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(n.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {t("confirmDeleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add / Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("editModalTitle") : t("addModalTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {showForm && (
              <CaseNatureForm
                natureData={selectedNature}
                isEditing={isEditing}
                onClose={closeForm}
                onSuccess={handleFormSuccess}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
