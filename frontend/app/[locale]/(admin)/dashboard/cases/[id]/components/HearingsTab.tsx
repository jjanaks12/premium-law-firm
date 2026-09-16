import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompositeDatePicker } from "@/components/ui/composite-date-picker";
import { useTranslations } from "next-intl";
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";

export default function HearingsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const t = useTranslations("HearingsTab");
  const tCases = useTranslations("CasesPage");
  const { axios } = useAxios();

  const isKnownCourt = (type: string) =>
    [
      "supremeCourt",
      "highCourt",
      "districtCourt",
      "specialCourt",
      "tribunal",
      "other",
    ].includes(type);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [hearingDate, setHearingDate] = useState("");
  const [nextHearingDate, setNextHearingDate] = useState("");
  const [hearingOrder, setHearingOrder] = useState("");
  const [hearingType, setHearingType] = useState("aadesh");

  const activeCourt =
    caseData.courtDetails?.find((d: any) => d.isActive) ||
    caseData.courtDetails?.[0];

  const [selectedCourtId, setSelectedCourtId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.patch(`/cases/${caseData.id}/hearings/${editId}`, {
          hearingDate: hearingDate || undefined,
          nextHearingDate: nextHearingDate || undefined,
          caseCourtDetailId: selectedCourtId || undefined,
          hearingOrder,
          hearingType,
        });
        toast.add({ title: t("successAdd") || "Success" }); // Or a generic success edit message
      } else {
        await axios.post(`/cases/${caseData.id}/hearings`, {
          hearingDate: hearingDate || undefined,
          nextHearingDate: nextHearingDate || undefined,
          caseCourtDetailId: selectedCourtId || undefined,
          hearingOrder,
          hearingType,
        });
        toast.add({ title: t("successAdd") });
      }
      setOpen(false);
      refresh();
      // Reset
      setHearingDate("");
      setNextHearingDate("");
      setHearingOrder("");
      setHearingType("aadesh");
      setEditId(null);
    } catch (error: any) {
      toast.add({
        title: t("errorAdd"),
        description: error.response?.data?.message || t("unknownError"),
        type: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (hearing: any) => {
    setEditId(hearing.id);
    setHearingDate(
      hearing.hearingDate ? hearing.hearingDate.substring(0, 16) : "",
    );
    setNextHearingDate(
      hearing.nextHearingDate ? hearing.nextHearingDate.substring(0, 16) : "",
    );
    setHearingOrder(hearing.hearingOrder || "");
    setHearingType(hearing.hearingType || "aadesh");
    setSelectedCourtId(hearing.caseCourtDetailId || activeCourt?.id || "");
    setOpen(true);
  };

  const handleDeleteClick = (hearingId: string) => {
    setDeleteId(hearingId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/hearings/${deleteId}`);
      toast.add({ title: t("successDelete") });
      refresh();
    } catch (error: any) {
      toast.add({
        title: t("errorTitle"),
        description: t("unknownError"),
        type: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("hearings")}</CardTitle>
        <Button
          onClick={() => {
            setEditId(null);
            setHearingDate("");
            setNextHearingDate("");
            setHearingOrder("");
            setHearingType("aadesh");
            setSelectedCourtId(activeCourt?.id || "");
            setOpen(true);
          }}
          size="sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> {t("addHearing")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.hearings && caseData.hearings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.hearings.map((h: any) => (
              <div
                key={h.id}
                className="p-5 border rounded-2xl bg-card hover:shadow-md transition-shadow flex flex-col relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                      {t("hearingDate")}
                    </span>
                    <span className="font-semibold text-lg text-primary flex items-center">
                      {h.hearingDate
                        ? new Date(h.hearingDate).toLocaleDateString()
                        : t("na")}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-card rounded-md shadow-sm border p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary rounded-md"
                      onClick={() => handleEditClick(h)}
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                      onClick={() => handleDeleteClick(h.id)}
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                      {t("nextHearingDate")}
                    </span>
                    <span className="font-medium text-sm">
                      {h.nextHearingDate
                        ? new Date(h.nextHearingDate).toLocaleDateString()
                        : t("na")}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                      {t("court")}
                    </span>
                    <span className="font-medium text-sm">
                      {h.caseCourtDetail
                        ? `${
                            isKnownCourt(h.caseCourtDetail.courtType)
                              ? tCases(h.caseCourtDetail.courtType)
                              : h.caseCourtDetail.courtType || t("na")
                          } ${h.caseCourtDetail.caseNumber ? `- ${h.caseCourtDetail.caseNumber}` : ""}`
                        : t("na")}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t">
                  <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                      Hearing Type
                    </span>
                    <span className="font-medium text-sm">
                      {h.hearingType === "failsala" ? "Failsala" : "Aadesh"}
                    </span>
                  </div>
                  
                  {h.hearingOrder && (
                    <div className="mt-2">
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                        Order / Decision
                      </p>
                      <p className="text-sm text-muted-foreground">{h.hearingOrder}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed rounded-xl bg-muted/5">
            <div className="bg-muted p-3 rounded-full mb-4">
              <PlusIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("noHearings")}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              There are no hearings scheduled for this case yet. Add the first
              hearing to track the schedule.
            </p>
            <Button onClick={() => setOpen(true)} variant="secondary">
              {t("addHearing")}
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editId ? t("editHearing") || "Edit Hearing" : t("addHearing")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("hearingDate")}</Label>
                <CompositeDatePicker
                  value={hearingDate}
                  onChange={(val) => setHearingDate(val)}
                  showTime={true}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("nextHearingDate")}</Label>
                <CompositeDatePicker
                  value={nextHearingDate}
                  onChange={(val) => setNextHearingDate(val)}
                  showTime={true}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("court")}</Label>
              <Select
                value={selectedCourtId}
                onValueChange={(val) => setSelectedCourtId(val || "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectCourt") || "Select Court"}>
                    {selectedCourtId &&
                    caseData.courtDetails?.find(
                      (c: any) => c.id === selectedCourtId,
                    )
                      ? (() => {
                          const c = caseData.courtDetails.find(
                            (cd: any) => cd.id === selectedCourtId,
                          );
                          return c.courtName || (isKnownCourt(c.courtType) ? tCases(c.courtType) : c.courtType) || c.courtLevel?.name || "Unknown Court";
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {caseData.courtDetails?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.courtName || (isKnownCourt(c.courtType) ? tCases(c.courtType) : c.courtType) || c.courtLevel?.name || "Unknown Court"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("orderType") || "Order Type"}</Label>
              <Select
                value={hearingType}
                onValueChange={(val) => setHearingType(val || "aadesh")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectOrderType") || "Select type"}>
                    {hearingType === "aadesh"
                      ? t("aadesh") || "Aadesh"
                      : hearingType === "failsala"
                        ? t("failsala") || "Failsala"
                        : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadesh">
                    {t("aadesh") || "Aadesh"}
                  </SelectItem>
                  <SelectItem value="failsala">
                    {t("failsala") || "Failsala"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("order")}</Label>
              <Textarea
                value={hearingOrder}
                onChange={(e) => setHearingOrder(e.target.value)}
                placeholder={t("summaryPlaceholder")}
                rows={4}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="destructive"
                className="mr-2"
                onClick={() => {
                  setOpen(false);
                  setEditId(null);
                  setHearingDate("");
                  setNextHearingDate("");
                  setHearingOrder("");
                  setHearingType("aadesh");
                }}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("saving") : t("save")}
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
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
