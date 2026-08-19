"use client";

import { useEffect, useState, useCallback } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  Loader2Icon,
  GlobeIcon,
  EyeIcon,
  EyeOffIcon,
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
import { useRouter } from "@/src/i18n/routing";
import { Input } from "@/components/ui/input";

interface PageType {
  id: string;
  name: string;
  slug: string;
}

interface PageRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "published";
  locale: "en" | "np";
  parent_id: string | null;
  page_type: PageType | null;
  thumbnail: { url: string } | null;
  seo: { meta_title: string | null; meta_description: string | null } | null;
  created_at: string;
  updated_at: string;
  content?: string;
  detail?: any;
  schema?: any;
}

const STATUS_CLASSES = {
  draft: "bg-amber-500/10 border-amber-500/30 text-amber-600",
  published: "bg-green-500/10 border-green-500/30 text-green-600",
};

const LOCALE_CLASSES = {
  en: "bg-blue-500/10 border-blue-500/30 text-blue-600",
  np: "bg-violet-500/10 border-violet-500/30 text-violet-600",
};

export default function PagesPage() {
  const { axios } = useAxios();
  const router = useRouter();

  const [pages, setPages] = useState<PageRecord[]>([]);
  const [pageTypes, setPageTypes] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [localeFilter, setLocaleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchPageTypes = useCallback(async () => {
    try {
      const { data } = await axios.get("/pages/page-types");
      if (data.success) setPageTypes(data.data);
    } catch (err: any) {
      if (err.isNetworkError || err.code === "ERR_NETWORK") {
        console.warn("[PagesPage] Network error fetching page types");
      }
    }
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (localeFilter) params.append("locale", localeFilter);
      if (typeFilter) params.append("page_type_id", typeFilter);

      const { data } = await axios.get(`/pages?${params.toString()}`);
      if (data.success) {
        const filtered = search
          ? data.data.filter(
              (p: PageRecord) =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.slug.toLowerCase().includes(search.toLowerCase()),
            )
          : data.data;
        setPages(filtered);
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.message || "Failed to load pages",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, localeFilter, typeFilter]);

  useEffect(() => {
    fetchPageTypes();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPages(), 300);
    return () => clearTimeout(t);
  }, [fetchPages]);

  const handleTogglePublish = async (page: PageRecord) => {
    try {
      const endpoint =
        page.status === "published"
          ? `/pages/${page.id}/unpublish`
          : `/pages/${page.id}/publish`;
      const { data } = await axios.post(endpoint);
      if (data.success) {
        toast.add({
          title: "Success",
          description:
            page.status === "published" ? "Page unpublished" : "Page published",
          type: "success",
        });
        fetchPages();
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Action failed",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data } = await axios.delete(`/pages/${id}`);
      if (data.success) {
        toast.add({
          title: "Deleted",
          description: "Page deleted",
          type: "success",
        });
        fetchPages();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-2">
            <BookOpenIcon className="h-8 w-8 text-primary" />
            Pages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage website pages with multilingual content and SEO metadata
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/pages/create")}
          className="w-full sm:w-auto"
          permission="pages.create"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Page
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <Input
          placeholder="Search by title or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-xs rounded-xl"
        />
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <select
            value={localeFilter}
            onChange={(e) => setLocaleFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Locales</option>
            <option value="en">English</option>
            <option value="np">Nepali</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Types</option>
            {pageTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading pages…
            </span>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <BookOpenIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-bold">No pages found</h3>
            <p className="text-sm text-muted-foreground">
              Create your first page to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 px-6 font-semibold">Title</TableHead>
                <TableHead className="py-4 px-6 font-semibold">Slug</TableHead>
                <TableHead className="py-4 px-6 font-semibold">Type</TableHead>
                <TableHead className="py-4 px-6 font-semibold">
                  Locale
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold">
                  Status
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {pages.map((page: PageRecord) => (
                <TableRow key={page.id}>
                  <TableCell className="py-4 px-6 font-semibold text-foreground max-w-55">
                    <span className="line-clamp-1">{page.title}</span>
                    {page.seo?.meta_description && (
                      <p className="text-xs text-muted-foreground font-normal line-clamp-1 mt-0.5">
                        {page.seo.meta_description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-muted-foreground font-mono text-xs">
                    /{page.slug}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-muted-foreground">
                    {page.page_type?.name ?? (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${LOCALE_CLASSES[page.locale]}`}
                    >
                      <GlobeIcon className="h-3 w-3" />
                      {page.locale === "en" ? "EN" : "NP"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CLASSES[page.status]}`}
                    >
                      {page.status.charAt(0).toUpperCase() +
                        page.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex gap-2 justify-end items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/dashboard/pages/${page.id}/edit`)}
                        permission="pages.update"
                        title="Edit page"
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${page.status === "published" ? "text-amber-500 hover:text-amber-600" : "text-green-500 hover:text-green-600"}`}
                        onClick={() => handleTogglePublish(page)}
                        permission="pages.update"
                        title={
                          page.status === "published" ? "Unpublish" : "Publish"
                        }
                      >
                        {page.status === "published" ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        onClick={() => {
                          setDeleteId(page.id);
                          setConfirmDeleteOpen(true);
                        }}
                        permission="pages.delete"
                        title="Delete page"
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

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the page. You can restore it from the
              database if needed.
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
