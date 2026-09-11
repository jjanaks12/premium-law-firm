import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useLocale, useTranslations } from "next-intl";

const isKnownCourt = (type: string) =>
  [
    "supremeCourt",
    "highCourt",
    "districtCourt",
    "specialCourt",
    "tribunal",
    "other",
  ].includes(type);

export default function OverviewTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const t = useTranslations("OverviewTab");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [isLead, setIsLead] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (open && users.length === 0) {
      axios
        .get("/users")
        .then((res) => {
          const lawyersOnly = res.data.data.filter(
            (u: any) => u.role?.name?.toLowerCase() === "lawyer",
          );
          setUsers(lawyersOnly);
        })
        .catch(console.error);
    }
  }, [open, users.length]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/lawyers`, { userId, isLead });
      toast.add({ title: t("lawyerAssigned") });
      setOpen(false);
      refresh();
      setUserId("");
      setIsLead(false);
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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/lawyers/${deleteId}`);
      toast.add({ title: t("lawyerRemoved") });
      refresh();
    } catch (e) {
      toast.add({ title: t("errorTitle"), type: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const activeDetail =
    caseData?.courtDetails?.find((d: any) => d.isActive) ||
    caseData?.courtDetails?.[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("caseInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-all duration-300 hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("caseNumber")}</p>
            <p className="font-medium text-lg">{caseData.id.split("-")[0]}</p>
          </div>
          <div className="p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-all duration-300 hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("court")}</p>
            <p className="font-medium">
              {activeDetail
                ? isKnownCourt(activeDetail.courtLevel?.type)
                  ? locale == "np"
                    ? activeDetail.courtLevel?.nepaliName
                    : activeDetail.courtLevel?.englishName
                  : activeDetail.courtLevel?.englishName || t("na")
                : t("na")}
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-all duration-300 hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("status")}</p>
            <p className="font-medium">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {caseData.status}
              </span>
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-all duration-300 hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("nature")}</p>
            <p className="font-medium">
              {locale == "np"
                ? caseData.nature?.nepaliName
                : caseData.nature?.englishName || t("na")}
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-all duration-300 hover:shadow-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t("faat")}</p>
            <p className="font-medium">
              {activeDetail?.sectionCourtRoom || t("na")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("lawyers")}</CardTitle>
          <Button onClick={() => setOpen(true)} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" /> {t("assignLawyer")}
          </Button>
        </CardHeader>
        <CardContent>
          {caseData.lawyers && caseData.lawyers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseData.lawyers.map((l: any) => (
                <div
                  key={l.userId}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {l.user?.first_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <span className="font-semibold block">
                        {l.user?.first_name} {l.user?.last_name}
                      </span>
                      {l.isLead && (
                        <span className="text-xs bg-gold/20 text-gold-soft px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                          {t("lead")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-full"
                    onClick={() => setDeleteId(l.userId)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed rounded-xl bg-muted/5">
              <div className="bg-muted p-3 rounded-full mb-4">
                <PlusIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t("noLawyers")}</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Get started by assigning a lawyer to this case. They will be able to manage details and attend hearings.
              </p>
              <Button onClick={() => setOpen(true)} variant="outline">
                {t("assignLawyer")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("assignLawyer")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("lawyers")}</Label>
              <Select
                value={userId}
                onValueChange={(a) => setUserId(a as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectLawyer")}>
                    {userId
                      ? (() => {
                          const u = users.find((x) => x.id === userId);
                          return u
                            ? `${u.first_name} ${u.last_name}`
                            : t("selectLawyer");
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isLead"
                checked={isLead}
                onCheckedChange={(val) => setIsLead(!!val)}
              />
              <Label htmlFor="isLead">{t("isLeadLawyer")}</Label>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="destructive"
                className="mr-2"
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading || !userId}>
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
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
