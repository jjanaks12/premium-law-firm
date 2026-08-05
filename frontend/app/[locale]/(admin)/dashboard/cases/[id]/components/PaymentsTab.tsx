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
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";

export default function PaymentsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
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
        .get("/users?status=active")
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
      toast.add({ title: "Payment added" });
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
      await axios.delete(`/cases/${caseData.id}/payments/${deleteId}`);
      toast.add({ title: "Payment deleted" });
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
        <CardTitle>Payments</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Add Payment
        </Button>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium mb-4">Payment Transfers</h3>
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
                      Date:{" "}
                    </span>
                    <span className="font-medium">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Amount:{" "}
                    </span>
                    <span className="font-medium font-mono text-green-600">
                      {p.amount}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Method:{" "}
                    </span>
                    <span>{p.method || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Ref No:{" "}
                    </span>
                    <span>{p.referenceNo || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Received By:{" "}
                    </span>
                    <span>
                      {p.receivedByUser
                        ? `${p.receivedByUser.first_name} ${p.receivedByUser.last_name}`
                        : p.receivedBy || "N/A"}
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
          <p className="text-muted-foreground">No payments recorded.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Amount <span className="text-destructive">*</span>
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
                <Label>Date</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={method}
                  onValueChange={(val) => setMethod(val as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="e.g. Bank Transfer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Online Payment">
                      Online Payment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference No.</Label>
                <Input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Received By (Internal User)</Label>
                <Select
                  value={receivedByUserId}
                  onValueChange={(val) => setReceivedByUserId(val as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select internal user">
                      {receivedByUserId !== "none"
                        ? (() => {
                            const u = users.find((x) => x.id === receivedByUserId);
                            return u
                              ? `${u.first_name} ${u.last_name}`
                              : "Select internal user";
                          })()
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (External)</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Or Received By (External Name)</Label>
                <Input
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={receivedByUserId !== "none"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                {loading ? "Saving..." : "Save"}
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              payment.
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
