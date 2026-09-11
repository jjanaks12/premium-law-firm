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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> {t("addPayment")}
        </Button>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium mb-4">{t("paymentTransfers")}</h3>
        {caseData.payments && caseData.payments.length > 0 ? (
          <div className="space-y-4">
            {caseData.payments.map((p: any) => (
              <div
                key={p.id}
                className="p-4 border rounded-lg flex justify-between items-start"
              >
                <div className="grid grid-cols-2 gap-4 grow">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("dateLabel")}:{" "}
                    </span>
                    <span className="font-medium">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString()
                        : t("na")}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("amountLabel")}:{" "}
                    </span>
                    <span className="font-medium font-mono text-green-600">
                      {p.amount}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("methodLabel")}:{" "}
                    </span>
                    <span>{p.method || t("na")}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("refNoLabel")}:{" "}
                    </span>
                    <span>{p.referenceNo || t("na")}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("receivedBy")}:{" "}
                    </span>
                    <span>
                      {p.receivedByUser
                        ? `${p.receivedByUser.first_name} ${p.receivedByUser.last_name}`
                        : p.receivedBy || t("na")}
                    </span>
                  </div>
                  {p.notes && (
                    <div className="col-span-2 mt-2">
                      <p className="text-sm text-muted-foreground">{p.notes}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 ml-4"
                  onClick={() => handleDeleteClick(p.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noPayments")}</p>
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
