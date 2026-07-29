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

export default function CounselingsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Counseling State
  const [openCounseling, setOpenCounseling] = useState(false);
  const [loadingCounseling, setLoadingCounseling] = useState(false);
  const [counselingDate, setCounselingDate] = useState("");
  const [counselingNotes, setCounselingNotes] = useState("");

  const handleCounselingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCounseling(true);
    try {
      await axios.post(`/cases/${caseData.id}/counselings`, {
        date: counselingDate || undefined,
        notes: counselingNotes,
      });
      toast.add({ title: "Counseling added" });
      setOpenCounseling(false);
      refresh();
      setCounselingDate("");
      setCounselingNotes("");
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.response?.data?.message || "Unknown error",
        type: "destructive",
      });
    } finally {
      setLoadingCounseling(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/counselings/${deleteId}`);
      toast.add({ title: "Counseling deleted" });
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
          <CardTitle>Counselling Updates</CardTitle>
          <Button onClick={() => setOpenCounseling(true)} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Counselling
          </Button>
        </CardHeader>
        <CardContent>
          {caseData.counselings && caseData.counselings.length > 0 ? (
            <div className="space-y-4">
              {caseData.counselings.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 border rounded-lg flex justify-between"
                >
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Date:{" "}
                      {c.date ? new Date(c.date).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="mt-2 text-sm">{c.notes}</div>
                    {c.counselor && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Counselor: {c.counselor.first_name}{" "}
                        {c.counselor.last_name}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(c.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No counselling updates recorded.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={openCounseling} onOpenChange={setOpenCounseling}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Counselling Update</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCounselingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={counselingDate}
                onChange={(e) => setCounselingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={counselingNotes}
                onChange={(e) => setCounselingNotes(e.target.value)}
                required
                rows={4}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setOpenCounseling(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loadingCounseling}>
                {loadingCounseling ? "Saving..." : "Save"}
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
              This action cannot be undone. This will permanently delete the counseling.
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
