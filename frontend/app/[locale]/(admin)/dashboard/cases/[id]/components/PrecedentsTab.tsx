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

export default function PrecedentsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [decisionNumber, setDecisionNumber] = useState("");
  const [plaintiff, setPlaintiff] = useState("");
  const [defendant, setDefendant] = useState("");
  const [citationNotes, setCitationNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/precedents`, {
        decisionNumber,
        plaintiff,
        defendant,
        citationNotes,
      });
      toast.add({ title: "Precedent added" });
      setOpen(false);
      refresh();
      setDecisionNumber("");
      setPlaintiff("");
      setDefendant("");
      setCitationNotes("");
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
    if (!confirm("Delete precedent?")) return;
    try {
      await axios.delete(`/cases/${caseData.id}/precedents/${id}`);
      toast.add({ title: "Precedent deleted" });
      refresh();
    } catch (e) {
      toast.add({ title: "Error", type: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Precedents</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Add Precedent
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.precedents && caseData.precedents.length > 0 ? (
          <div className="space-y-4">
            {caseData.precedents.map((p: any) => (
              <div
                key={p.id}
                className="p-4 border rounded-lg flex justify-between items-start"
              >
                <div className="grid grid-cols-2 gap-4 grow">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Decision Number:{" "}
                    </span>
                    <span className="font-medium">
                      {p.decisionNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Plaintiff:{" "}
                    </span>
                    <span>{p.plaintiff || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Defendant:{" "}
                    </span>
                    <span>{p.defendant || "N/A"}</span>
                  </div>
                  {p.citationNotes && (
                    <div className="col-span-2 mt-2">
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm text-muted-foreground">
                        {p.citationNotes}
                      </p>
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
          <p className="text-muted-foreground">No precedents recorded.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Precedent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Decision Number</Label>
              <Input
                value={decisionNumber}
                onChange={(e) => setDecisionNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plaintiff</Label>
                <Input
                  value={plaintiff}
                  onChange={(e) => setPlaintiff(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Defendant</Label>
                <Input
                  value={defendant}
                  onChange={(e) => setDefendant(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Citation Notes</Label>
              <Textarea
                value={citationNotes}
                onChange={(e) => setCitationNotes(e.target.value)}
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
