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

export default function ProceedingsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Proceeding State
  const [openProceeding, setOpenProceeding] = useState(false);
  const [loadingProceeding, setLoadingProceeding] = useState(false);
  const [courtLevels, setCourtLevels] = useState<any[]>([]);
  const [courtLevelId, setCourtLevelId] = useState("");
  const [courtName, setCourtName] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [chargeCounseling, setChargeCounseling] = useState("");
  const [verdict, setVerdict] = useState("");

  useEffect(() => {
    if (openProceeding && courtLevels.length === 0) {
      axios
        .get("/cases/meta/court-levels")
        .then((res) => setCourtLevels(res.data.data))
        .catch(console.error);
    }
  }, [openProceeding, courtLevels.length, axios]);

  const handleProceedingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProceeding(true);
    try {
      await axios.post(`/cases/${caseData.id}/proceedings`, {
        courtLevelId,
        courtName,
        judgeName,
        chargeCounseling,
        verdict,
      });
      toast.add({ title: "Proceeding added" });
      setOpenProceeding(false);
      refresh();
      setCourtLevelId("");
      setCourtName("");
      setJudgeName("");
      setChargeCounseling("");
      setVerdict("");
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.response?.data?.message || "Unknown error",
        type: "destructive",
      });
    } finally {
      setLoadingProceeding(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/proceedings/${deleteId}`);
      toast.add({ title: "Proceeding deleted" });
      refresh();
    } catch (e) {
      toast.add({ title: "Error", type: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Court Proceedings</CardTitle>
          <Button onClick={() => setOpenProceeding(true)} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Proceeding
          </Button>
        </CardHeader>
        <CardContent>
          {caseData.proceedings && caseData.proceedings.length > 0 ? (
            <div className="space-y-4">
              {caseData.proceedings.map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 border rounded-lg flex justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {p.courtName} ({p.courtLevel?.name})
                    </div>
                    {p.judgeName && (
                      <div className="text-sm mt-1">Judge: {p.judgeName}</div>
                    )}
                    {p.chargeCounseling && (
                      <div className="text-sm mt-2">
                        Counselling: {p.chargeCounseling}
                      </div>
                    )}
                    {p.verdict && (
                      <div className="text-sm mt-2 font-medium">
                        Verdict: {p.verdict}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No proceedings recorded.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={openProceeding} onOpenChange={setOpenProceeding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Proceeding</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProceedingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Court Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={courtLevelId}
                onValueChange={(val) => setCourtLevelId(val || "")}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select court level" />
                </SelectTrigger>
                <SelectContent>
                  {courtLevels.map((lvl) => (
                    <SelectItem key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Court Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Judge Name</Label>
              <Input
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Charge/Counselling</Label>
              <Textarea
                value={chargeCounseling}
                onChange={(e) => setChargeCounseling(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Verdict</Label>
              <Textarea
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setOpenProceeding(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loadingProceeding}>
                {loadingProceeding ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the proceeding.
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
    </div>
  );
}
