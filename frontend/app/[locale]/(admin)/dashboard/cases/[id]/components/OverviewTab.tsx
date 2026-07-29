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

export default function OverviewTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [isLead, setIsLead] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open && users.length === 0) {
      axios
        .get("/users")
        .then((res) => setUsers(res.data.data))
        .catch(console.error);
    }
  }, [open, users.length, axios]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/lawyers`, { userId, isLead });
      toast.add({ title: "Lawyer assigned" });
      setOpen(false);
      refresh();
      setUserId("");
      setIsLead(false);
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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/lawyers/${deleteId}`);
      toast.add({ title: "Lawyer removed" });
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
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Case Number</p>
            <p className="font-medium">{caseData.caseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Registration Date</p>
            <p className="font-medium">
              {caseData.registrationDate
                ? new Date(caseData.registrationDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{caseData.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nature</p>
            <p className="font-medium">{caseData.nature?.name || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lawyers</CardTitle>
          <Button onClick={() => setOpen(true)} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" /> Assign Lawyer
          </Button>
        </CardHeader>
        <CardContent>
          {caseData.lawyers && caseData.lawyers.length > 0 ? (
            <ul className="space-y-2">
              {caseData.lawyers.map((l: any) => (
                <li
                  key={l.userId}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {l.user?.first_name} {l.user?.last_name}
                    </span>
                    {l.isLead && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Lead
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(l.userId)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No lawyers assigned.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lawyer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label>Lawyer</Label>
              <Select
                value={userId}
                onValueChange={(a) => setUserId(a as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lawyer" />
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
              <Label htmlFor="isLead">Is Lead Lawyer?</Label>
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
              <Button type="submit" disabled={loading || !userId}>
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
              This action cannot be undone. This will remove the lawyer from the
              case.
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
