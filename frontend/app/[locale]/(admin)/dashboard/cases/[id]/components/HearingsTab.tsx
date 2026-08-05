import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { PlusIcon, Trash2Icon } from "lucide-react";
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

  const [hearingDate, setHearingDate] = useState("");
  const [nextHearingDate, setNextHearingDate] = useState("");
  const [hearingOrder, setHearingOrder] = useState("");

  const activeCourt =
    caseData.courtDetails?.find((d: any) => d.isActive) ||
    caseData.courtDetails?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/hearings`, {
        hearingDate: hearingDate || undefined,
        nextHearingDate: nextHearingDate || undefined,
        caseCourtDetailId: activeCourt?.id,
        hearingOrder,
      });
      toast.add({ title: t("successAdd") });
      setOpen(false);
      refresh();
      // Reset
      setHearingDate("");
      setNextHearingDate("");
      setHearingOrder("");
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
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> {t("addHearing")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.hearings && caseData.hearings.length > 0 ? (
          <div className="space-y-4">
            {caseData.hearings.map((h: any) => (
              <div
                key={h.id}
                className="p-4 border rounded-lg flex justify-between items-start"
              >
                <div className="grid grid-cols-2 gap-2 grow">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("hearingDate")}:{" "}
                    </span>
                    <span className="font-medium">
                      {h.hearingDate
                        ? new Date(h.hearingDate).toLocaleDateString()
                        : t("na")}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("nextHearingDate")}:{" "}
                    </span>
                    <span className="font-medium">
                      {h.nextHearingDate
                        ? new Date(h.nextHearingDate).toLocaleDateString()
                        : t("na")}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      {t("court")}:{" "}
                    </span>
                    <span>
                      {h.caseCourtDetail
                        ? isKnownCourt(h.caseCourtDetail.courtType)
                          ? tCases(h.caseCourtDetail.courtType)
                          : h.caseCourtDetail.courtType
                        : t("na")}
                    </span>
                  </div>
                  {h.hearingOrder && (
                    <div className="col-span-2 mt-2">
                      <p className="text-sm font-medium">{t("order")}:</p>
                      <p className="text-sm text-muted-foreground">
                        {h.hearingOrder}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 ml-4"
                  onClick={() => handleDeleteClick(h.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noHearings")}</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addHearing")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("hearingDate")}</Label>
                <Input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("nextHearingDate")}</Label>
                <Input
                  type="date"
                  value={nextHearingDate}
                  onChange={(e) => setNextHearingDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("court")}</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                {activeCourt
                  ? isKnownCourt(activeCourt.courtType)
                    ? tCases(activeCourt.courtType)
                    : activeCourt.courtType
                  : t("na")}
              </div>
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
                variant="outline"
                className="mr-2"
                onClick={() => setOpen(false)}
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
