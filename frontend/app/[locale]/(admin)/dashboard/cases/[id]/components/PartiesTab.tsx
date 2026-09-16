import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon, Loader2Icon, EditIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
  const t = useTranslations("PartiesTab");
  const locale = useLocale();
  const { axios } = useAxios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [partyName, setPartyName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [citizenshipNo, setCitizenshipNo] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [temporaryAddress, setTemporaryAddress] = useState("");
  const [hasWaris, setHasWaris] = useState(false);
  const [warisName, setWarisName] = useState("");
  const [warisCitizenship, setWarisCitizenship] = useState("");
  const [warisContact, setWarisContact] = useState("");
  const [warisPermanentAddress, setWarisPermanentAddress] = useState("");
  const [warisTemporaryAddress, setWarisTemporaryAddress] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const resetForm = () => {
    setPartyName("");
    setRoleId("");
    setContactNo("");
    setCitizenshipNo("");
    setPermanentAddress("");
    setTemporaryAddress("");
    setHasWaris(false);
    setWarisName("");
    setWarisCitizenship("");
    setWarisContact("");
    setWarisPermanentAddress("");
    setWarisTemporaryAddress("");
    setEditId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleEditClick = (p: any) => {
    setEditId(p.id);
    setPartyName(p.partyName || "");
    setRoleId(p.roleId || "");
    setContactNo(p.contactNo || "");
    setCitizenshipNo(p.citizenshipNo || "");
    setPermanentAddress(p.permanentAddress || "");
    setTemporaryAddress(p.temporaryAddress || "");

    if (p.waris && p.waris.length > 0) {
      const w = p.waris[0];
      setHasWaris(true);
      setWarisName(w.partyName || "");
      setWarisCitizenship(w.citizenshipNo || "");
      setWarisContact(w.contactNo || "");
      setWarisPermanentAddress(w.permanentAddress || "");
      setWarisTemporaryAddress(w.temporaryAddress || "");
    } else {
      setHasWaris(false);
      setWarisName("");
      setWarisCitizenship("");
      setWarisContact("");
      setWarisPermanentAddress("");
      setWarisTemporaryAddress("");
    }
    setOpen(true);
  };

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
      const payload = {
        partyName,
        roleId,
        contactNo,
        citizenshipNo,
        permanentAddress,
        temporaryAddress,
        waris: hasWaris
          ? {
              partyName: warisName,
              citizenshipNo: warisCitizenship,
              contactNo: warisContact,
              permanentAddress: warisPermanentAddress,
              temporaryAddress: warisTemporaryAddress,
            }
          : undefined,
      };

      if (editId) {
        await axios.put(`/cases/${caseData.id}/parties/${editId}`, payload);
        toast.add({ title: t("successUpdate") });
      } else {
        await axios.post(`/cases/${caseData.id}/parties`, payload);
        toast.add({ title: t("successAdd") });
      }

      setOpen(false);
      refresh();
      resetForm();
    } catch (error: any) {
      toast.add({
        title: t("errorTitle"),
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
      toast.add({ title: t("successDelete") });
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
        <CardTitle>{t("title")}</CardTitle>
        <Button onClick={handleOpenAdd} size="sm">
          <PlusIcon className="w-4 h-4 mr-2" /> {t("addParty")}
        </Button>
      </CardHeader>
      <CardContent>
        {caseData.parties && caseData.parties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.parties.map((p: any) => (
              <div
                key={p.id}
                className="p-5 border rounded-2xl bg-card hover:shadow-md transition-shadow flex items-start space-x-4 relative group"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                  {p.partyName?.charAt(0) || "P"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-lg">{p.partyName}</div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                        onClick={() => handleEditClick(p)}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => handleDeleteClick(p.id)}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground mb-2 mt-1">
                    {locale === "np" && p.role?.nepaliName
                      ? p.role?.nepaliName
                      : p.role?.name}
                  </div>

                  {p.contactNo && (
                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                      <span className="font-medium mr-1">{t("contact")}:</span>{" "}
                      {p.contactNo}
                    </div>
                  )}
                  {p.waris && p.waris.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/20 border rounded-xl text-sm">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                        {t("representative")}
                      </span>
                      <span className="font-medium flex items-center text-primary">
                        {p.waris[0].partyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed rounded-xl bg-muted/5">
            <div className="bg-muted p-3 rounded-full mb-4">
              <PlusIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("noParties")}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              No parties have been added yet. Include plaintiffs, defendants,
              and their representatives.
            </p>
            <Button onClick={handleOpenAdd} variant="secondary">
              {t("addParty")}
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? t("editParty") : t("addParty")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t("partyName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t("role")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={roleId}
                  onValueChange={(val) => setRoleId(val || "")}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("role")}>
                      {roleId && roles.length > 0
                        ? (() => {
                            const r = roles.find((role) => role.id === roleId);
                            return r
                              ? locale === "np" && r.nepaliName
                                ? r.nepaliName
                                : r.name
                              : undefined;
                          })()
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {locale === "np" && r.nepaliName
                          ? r.nepaliName
                          : r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("citizenshipNo")}</Label>
                <Input
                  value={citizenshipNo}
                  onChange={(e) => setCitizenshipNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("contactNo")}</Label>
                <Input
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("permanentAddress")}</Label>
                <Input
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("temporaryAddress")}</Label>
                <Input
                  value={temporaryAddress}
                  onChange={(e) => setTemporaryAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasWaris"
                  checked={hasWaris}
                  onChange={(e) => setHasWaris(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="hasWaris">{t("hasWaris")}</Label>
              </div>

              {hasWaris && (
                <div className="pl-6 border-l-2 border-primary/20 space-y-4">
                  <h5 className="text-sm font-semibold">{t("warisDetails")}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {t("warisName")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={warisName}
                        onChange={(e) => setWarisName(e.target.value)}
                        placeholder={t("warisName")}
                        required={hasWaris}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("citizenshipNo")}</Label>
                      <Input
                        value={warisCitizenship}
                        onChange={(e) => setWarisCitizenship(e.target.value)}
                        placeholder={t("citizenshipNo")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("contactNo")}</Label>
                      <Input
                        value={warisContact}
                        onChange={(e) => setWarisContact(e.target.value)}
                        placeholder={t("contactNo")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("permanentAddress")}</Label>
                      <Input
                        value={warisPermanentAddress}
                        onChange={(e) =>
                          setWarisPermanentAddress(e.target.value)
                        }
                        placeholder={t("permanentAddress")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("temporaryAddress")}</Label>
                      <Input
                        value={warisTemporaryAddress}
                        onChange={(e) =>
                          setWarisTemporaryAddress(e.target.value)
                        }
                        placeholder={t("temporaryAddress")}
                      />
                    </div>
                  </div>
                </div>
              )}
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
              <Button type="submit" disabled={loading || !partyName || !roleId}>
                {loading && (
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editId ? t("update") : t("save")}
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
              {t("confirmDeleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
