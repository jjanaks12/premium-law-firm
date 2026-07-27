"use client";

import { useEffect, useState, useCallback } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FolderCogIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  Loader2Icon,
  SaveIcon,
  XIcon,
} from "lucide-react";
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

interface PageType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

const emptyForm = { name: "", slug: "", description: "" };

export default function PageTypesPage() {
  const { axios } = useAxios();

  const [pageTypes, setPageTypes] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchPageTypes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/pages/page-types");
      if (data.success) setPageTypes(data.data);
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.message || "Failed to load page types",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageTypes();
  }, []);

  // Auto-generate slug from name when creating
  useEffect(() => {
    if (!editingId && form.name) {
      setForm((f) => ({
        ...f,
        slug: f.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-"),
      }));
    }
  }, [form.name, editingId]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.add({
        title: "Validation",
        description: "Name and slug are required",
        type: "error",
      });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/pages/page-types/${editingId}`, form);
        toast.add({
          title: "Updated",
          description: "Page type updated",
          type: "success",
        });
      } else {
        await axios.post("/pages/page-types", form);
        toast.add({
          title: "Created",
          description: "Page type created",
          type: "success",
        });
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchPageTypes();
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Operation failed",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pt: PageType) => {
    setEditingId(pt.id);
    setForm({
      name: pt.name,
      slug: pt.slug,
      description: pt.description ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string) => {
    try {
      const { data } = await axios.delete(`/pages/page-types/${id}`);
      if (data.success) {
        toast.add({
          title: "Deleted",
          description: "Page type deleted",
          type: "success",
        });
        fetchPageTypes();
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Delete failed",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-2">
          <FolderCogIcon className="h-8 w-8 text-primary" />
          Page Types
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage categories for your pages (e.g. Practice Areas, Case Studies)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4 h-fit">
          <h2 className="text-base font-semibold font-serif">
            {editingId ? "Edit Page Type" : "Add New Type"}
          </h2>

          <div className="space-y-1.5">
            <Label>
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Practice Areas"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="practice-areas"
              className="rounded-lg font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Optional description…"
              rows={2}
              className="rounded-lg resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
              permission={editingId ? "pages.update" : "pages.create"}
            >
              {saving ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : editingId ? (
                <SaveIcon className="mr-2 h-4 w-4" />
              ) : (
                <PlusIcon className="mr-2 h-4 w-4" />
              )}
              {editingId ? "Save Changes" : "Add Type"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Table Panel */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading…</span>
            </div>
          ) : pageTypes.length === 0 ? (
            <div className="text-center p-12 space-y-2">
              <FolderCogIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-bold">No page types yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your first type using the form.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold">
                    Slug
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {pageTypes.map((pt) => (
                  <TableRow
                    key={pt.id}
                    className={editingId === pt.id ? "bg-primary/5" : ""}
                  >
                    <TableCell className="py-4 px-6 font-semibold text-foreground">
                      {pt.name}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-mono text-xs text-muted-foreground">
                      {pt.slug}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-muted-foreground max-w-50">
                      <span className="line-clamp-1">
                        {pt.description ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(pt)}
                          permission="pages.update"
                          title="Edit"
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                          onClick={() => {
                            setDeleteId(pt.id);
                            setConfirmDeleteOpen(true);
                          }}
                          permission="pages.delete"
                          title="Delete"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page Type?</AlertDialogTitle>
            <AlertDialogDescription>
              Pages assigned this type will lose their type association. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (deleteId) {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                  setConfirmDeleteOpen(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
