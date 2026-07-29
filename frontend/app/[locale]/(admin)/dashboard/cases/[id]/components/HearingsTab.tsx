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
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";

export default function HearingsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [hearingDate, setHearingDate] = useState("");
  const [nextHearingDate, setNextHearingDate] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [hearingOrder, setHearingOrder] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/hearings`, {
        hearingDate: hearingDate || undefined,
        nextHearingDate: nextHearingDate || undefined,
        judgeName,
        hearingOrder,
      });
      toast.add({ title: "Hearing added successfully" });
      setOpen(false);
      refresh();
      // Reset
      setHearingDate("");
      setNextHearingDate("");
      setJudgeName("");
      setHearingOrder("");
    } catch (error: any) {
      toast.add({
        title: "Error adding hearing",
        description: error.response?.data?.message || "Unknown error",
        type: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hearingId: string) => {
    if (!confirm("Are you sure you want to delete this hearing?")) return;
    try {
      await axios.delete(`/cases/${caseData.id}/hearings/${hearingId}`);
      toast.add({ title: "Hearing deleted" });
      refresh();
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: "Unknown error",
        type: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hearings</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Add Hearing
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
                      Hearing Date:{" "}
                    </span>
                    <span className="font-medium">
                      {h.hearingDate
                        ? new Date(h.hearingDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Next Hearing:{" "}
                    </span>
                    <span className="font-medium">
                      {h.nextHearingDate
                        ? new Date(h.nextHearingDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">
                      Judge:{" "}
                    </span>
                    <span>{h.judgeName || "N/A"}</span>
                  </div>
                  {h.hearingOrder && (
                    <div className="col-span-2 mt-2">
                      <p className="text-sm font-medium">Order:</p>
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
                  onClick={() => handleDelete(h.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No hearings recorded.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Hearing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hearing Date</Label>
                <Input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Next Hearing Date</Label>
                <Input
                  type="date"
                  value={nextHearingDate}
                  onChange={(e) => setNextHearingDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Judge Name</Label>
              <Input
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
                placeholder="Name of the judge"
              />
            </div>
            <div className="space-y-2">
              <Label>Hearing Order / Notes</Label>
              <Textarea
                value={hearingOrder}
                onChange={(e) => setHearingOrder(e.target.value)}
                placeholder="Summary or order..."
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
