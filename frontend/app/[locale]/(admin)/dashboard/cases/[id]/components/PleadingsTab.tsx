import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export default function PleadingsTab({ caseData, refresh }: { caseData: any; refresh: () => void }) {
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [pleadingDate, setPleadingDate] = useState("");
  const [pleadingNotes, setPleadingNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/pleadings`, {
        pleadingDate: pleadingDate || undefined,
        pleadingNotes,
      });
      toast.add({ title: "Pleading added" });
      setOpen(false);
      refresh();
      setPleadingDate("");
      setPleadingNotes("");
    } catch (error: any) {
      toast.add({ title: "Error", description: error.response?.data?.message || "Unknown error", type: "destructive" });
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
      await axios.delete(`/cases/${caseData.id}/pleadings/${deleteId}`);
      toast.add({ title: "Pleading deleted" }); refresh();
    } catch (e) { toast.add({ title: "Error", type: "destructive" }); }
    finally {
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bahas / Pleadings</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Add Pleading
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.pleadings && caseData.pleadings.length > 0 ? (
          <div className="space-y-4">
            {caseData.pleadings.map((p: any) => (
              <div key={p.id} className="p-4 border rounded-lg flex justify-between items-start">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Date: {p.pleadingDate ? new Date(p.pleadingDate).toLocaleDateString() : 'N/A'}
                  </div>
                  {p.pleader && (
                    <div className="text-sm mt-1">
                      Pleader: {p.pleader.first_name} {p.pleader.last_name}
                    </div>
                  )}
                  <div className="mt-2 text-sm">{p.pleadingNotes}</div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 ml-4" onClick={() => handleDeleteClick(p.id)}>
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No bahas/pleadings recorded.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Pleading</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={pleadingDate} onChange={e => setPleadingDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes <span className="text-destructive">*</span></Label>
              <Textarea value={pleadingNotes} onChange={e => setPleadingNotes(e.target.value)} required rows={4} />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the pleading.
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
