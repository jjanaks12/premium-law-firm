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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompositeDatePicker } from "@/components/ui/composite-date-picker";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";

export default function PaymentsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const t = useTranslations("PaymentsTab");
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [receivedByUserId, setReceivedByUserId] = useState("none");
  const [notes, setNotes] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (open && users.length === 0) {
      axios
        .get("/users/options")
        .then((res) => {
          setUsers(res.data.data || []);
        })
        .catch(console.error);
    }
  }, [open, users.length, axios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/payments`, {
        amount: parseFloat(amount),
        paymentDate: paymentDate || undefined,
        method,
        referenceNo,
        receivedBy,
        receivedByUserId:
          receivedByUserId !== "none" ? receivedByUserId : undefined,
        notes,
      });
      toast.add({ title: t("successAdd") });
      setOpen(false);
      refresh();
      setAmount("");
      setPaymentDate("");
      setMethod("");
      setReferenceNo("");
      setReceivedBy("");
      setReceivedByUserId("none");
      setNotes("");
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
      await axios.delete(`/cases/${caseData.id}/payments/${deleteId}`);
      toast.add({ title: t("successDelete") });
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
          <PlusIcon className="w-4 h-4 mr-2" /> {t("addPayment")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.payments && caseData.payments.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs mb-2">{t("paymentTransfers")}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {caseData.payments.map((p: any) => (
              <div
                key={p.id}
                className="p-0 border rounded-2xl bg-card hover:shadow-md transition-shadow overflow-hidden flex flex-col relative group"
              >
                <div className="bg-green-500/10 p-4 border-b flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wider block mb-1">
                      {t("amountLabel")}
                    </span>
                    <span className="font-bold text-2xl text-green-600 tracking-tight">
                      Rs. {p.amount}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("dateLabel")}
                    </span>
                    <span className="font-medium text-sm">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString()
                        : t("na")}
                    </span>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4 grow">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">
                      {t("methodLabel")}
                    </span>
                    <span className="font-medium">{p.method || t("na")}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">
                      {t("refNoLabel")}
                    </span>
                    <span className="font-medium text-muted-foreground">{p.referenceNo || t("na")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">
                      {t("receivedBy")}
                    </span>
                    <span className="font-medium">
                      {p.receivedByUser
                        ? `${p.receivedByUser.first_name} ${p.receivedByUser.last_name}`
                        : p.receivedBy || t("na")}
                    </span>
                  </div>
                  {p.notes && (
                    <div className="col-span-2 mt-2 pt-2 border-t">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">{t("notesLabel")}</span>
                      <p className="text-sm italic text-muted-foreground">{p.notes}</p>
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => handleDeleteClick(p.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed rounded-xl bg-muted/5">
            <div className="bg-muted p-3 rounded-full mb-4">
              <PlusIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("noPayments")}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              No payments have been recorded for this case. Click below to add the first payment record.
            </p>
            <Button onClick={() => setOpen(true)} variant="secondary" className="rounded-full">
              {t("addPayment")}
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addPayment")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t("amountLabel")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dateLabel")}</Label>
                <CompositeDatePicker
                  value={paymentDate}
                  onChange={(val) => setPaymentDate(val)}
                  showTime={false}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("methodLabel")}</Label>
                <Select
                  value={method}
                  onValueChange={(val) => setMethod(val as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholderMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">{t("cash")}</SelectItem>
                    <SelectItem value="Bank Transfer">
                      {t("bankTransfer")}
                    </SelectItem>
                    <SelectItem value="Cheque">{t("cheque")}</SelectItem>
                    <SelectItem value="Online Payment">
                      {t("onlinePayment")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("refNoLabel")}</Label>
                <Input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("receivedByInternalLabel")}</Label>
                <Select
                  value={receivedByUserId}
                  onValueChange={(val) => setReceivedByUserId(val as string)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("receivedByInternalPlaceholder")}
                    >
                      {receivedByUserId !== "none"
                        ? (() => {
                            const u = users.find(
                              (x) => x.id === receivedByUserId,
                            );
                            return u
                              ? `${u.first_name} ${u.last_name}`
                              : t("receivedByInternalPlaceholder");
                          })()
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noneExternal")}</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("receivedByExternalLabel")}</Label>
                <Input
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  placeholder={t("receivedByExternalPlaceholder")}
                  disabled={receivedByUserId !== "none"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("notesLabel")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
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
