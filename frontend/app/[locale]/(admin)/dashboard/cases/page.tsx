"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  BriefcaseIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  Loader2Icon,
  EyeIcon,
} from "lucide-react";
import { useRouter } from "@/src/i18n/routing";
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

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayjs from "dayjs";
import { CaseData } from "@app/types";

export default function CasesPage() {
  const { axios } = useAxios();
  const t = useTranslations("CasesPage");
  const router = useRouter();

  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [partySearch, setPartySearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete Dialog States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/cases", {
        params: {
          search,
          partyName: partySearch,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      if (data.data) {
        setCases(data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch cases:", err);
      toast.add({
        title: "Error",
        description: "Failed to fetch cases.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCases();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, partySearch, statusFilter]);

  // Handlers for Add/Edit Form
  const handleAddClick = () => {
    router.push("/dashboard/cases/create");
  };

  const handleEditClick = (c: CaseData) => {
    router.push(`/dashboard/cases/${c.id}/edit`);
  };

  // Handlers for Delete
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${deleteId}`);
      toast.add({
        title: "Success",
        description: "Case deleted successfully.",
        type: "success",
      });
      fetchCases();
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete case",
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
            <BriefcaseIcon className="h-6 w-6 text-primary" />
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
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border">
        <Input
          placeholder={t("searchPlaceholder") + " / Darta No."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Search by Party / Waris"
          value={partySearch}
          onChange={(e) => setPartySearch(e.target.value)}
          className="w-full"
        />
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val ?? "all")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("colCaseNumber")}</TableHead>
                <TableHead>{t("colCaseName")}</TableHead>
                <TableHead>{t("colNature")}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{t("colRegDate")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2Icon className="h-8 w-8 animate-spin mb-2" />
                      {t("loading")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <BriefcaseIcon className="h-12 w-12 mb-2 text-muted-foreground/50" />
                      <p className="font-medium text-foreground">
                        {t("noCasesFound")}
                      </p>
                      <p className="text-sm">{t("noCasesFoundDesc")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.caseNumber}
                    </TableCell>
                    <TableCell>{c.caseName}</TableCell>
                    <TableCell>
                      {c.nature ? c.nature.name : c.natureId}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : c.status === "Closed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {c.status || "Draft"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.registrationDate
                        ? dayjs(c.registrationDate).format("MMM DD, YYYY")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/dashboard/cases/${c.id}`)
                          }
                          title="View Details"
                          permission="cases.read"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(c)}
                          permission="cases.update"
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(c.id)}
                          permission="cases.delete"
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
    </div>
  );
}
