import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [method, setMethod] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/payments`, {
        amount: parseFloat(amount),
        paymentDate: paymentDate || undefined,
        method,
        referenceNo,
        notes,
      });
      toast.add({ title: "Payment added" });
      setOpen(false);
      refresh();
      setAmount("");
      setPaymentDate("");
      setMethod("");
      setReferenceNo("");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete payment?")) return;
    try {
      await axios.delete(`/cases/${caseData.id}/payments/${id}`);
      toast.add({ title: "Payment deleted" });
      refresh();
    } catch (e) {
      toast.add({ title: "Error", type: "destructive" });
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
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Overall Payment Status</h3>
          <p className="text-sm">
            <span className="text-muted-foreground">Status:</span>{" "}
            {caseData.paymentStatus}
          </p>
        </div>

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
                  onClick={() => handleDelete(p.id)}
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
    </Card>
  );
}
