import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon, Loader2Icon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";

export default function PartiesTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [partyName, setPartyName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [representative, setRepresentative] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open && roles.length === 0) {
      axios
        .get("/cases/meta/party-roles")
        .then((res) => {
          setRoles(res.data.data);
        })
        .catch((err) => console.error(err));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !roleId) return;

    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/parties`, {
        partyName,
        roleId,
        contactInfo,
        representative,
      });
      toast.add({ title: "Party added successfully" });
      setOpen(false);
      refresh();
      // Reset
      setPartyName("");
      setRoleId("");
      setContactInfo("");
      setRepresentative("");
    } catch (error: any) {
      toast.add({
        title: "Error adding party",
        description: error.response?.data?.message || "Unknown error",
        type: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (partyId: string) => {
    setDeleteId(partyId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/cases/${caseData.id}/parties/${deleteId}`);
      toast.add({ title: "Party deleted" });
      refresh();
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.response?.data?.message || "Unknown error",
        type: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Parties</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> Add Party
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.parties && caseData.parties.length > 0 ? (
          <div className="space-y-4">
            {caseData.parties.map((p: any) => (
              <div
                key={p.id}
                className="p-4 border rounded-lg flex justify-between items-start"
              >
                <div>
                  <div className="font-medium">{p.partyName}</div>
                  <div className="text-sm text-muted-foreground">
                    Role: {p.role?.name}
                  </div>
                  {p.contactInfo && (
                    <div className="text-sm mt-2">Contact: {p.contactInfo}</div>
                  )}
                  {p.representative && (
                    <div className="text-sm mt-2">Representative (Waris): {p.representative}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteClick(p.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No parties recorded.</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Party</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Party Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={roleId}
                onValueChange={(val) => setRoleId(val || "")}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact Info (Optional)</Label>
              <Input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone, email, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Representative (Optional)</Label>
              <Input
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                placeholder="Waris or Authorized Representative"
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
              <Button type="submit" disabled={loading || !partyName || !roleId}>
                {loading && (
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save
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
              This action cannot be undone. This will permanently delete the party from the case.
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
