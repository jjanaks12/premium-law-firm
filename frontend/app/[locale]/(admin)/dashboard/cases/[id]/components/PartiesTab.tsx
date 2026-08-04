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
  const [contactInfo, setContactInfo] = useState("");
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
    setContactInfo("");
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
    setContactInfo(p.contactInfo || "");
    
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
        contactInfo,
        waris: hasWaris ? {
          partyName: warisName,
          citizenshipNo: warisCitizenship,
          contactNo: warisContact,
          permanentAddress: warisPermanentAddress,
          temporaryAddress: warisTemporaryAddress,
        } : undefined
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
          <div className="space-y-4">
            {caseData.parties.map((p: any) => (
              <div
                key={p.id}
                className="p-4 border rounded-lg flex justify-between items-start"
              >
                <div>
                  <div className="font-medium">{p.partyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {t("role")}: {locale === "np" && p.role?.nepaliName ? p.role?.nepaliName : p.role?.name}
                  </div>
                  {p.contactInfo && (
                    <div className="text-sm mt-2">{t("contact")}: {p.contactInfo}</div>
                  )}
                  {p.waris && p.waris.length > 0 && (
                    <div className="text-sm mt-2">{t("representative")}: {p.waris[0].partyName}</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(p)}
                  >
                    <EditIcon className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(p.id)}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t("noParties")}</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? t("editParty") : t("addParty")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectTrigger>
                  <SelectValue placeholder={t("role")} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {locale === "np" && r.nepaliName ? r.nepaliName : r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("contactInfo")}</Label>
              <Input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone, email, etc."
              />
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
                      <Label>{t("warisName")} <span className="text-destructive">*</span></Label>
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
                        onChange={(e) => setWarisPermanentAddress(e.target.value)}
                        placeholder={t("permanentAddress")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("temporaryAddress")}</Label>
                      <Input
                        value={warisTemporaryAddress}
                        onChange={(e) => setWarisTemporaryAddress(e.target.value)}
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
                variant="outline"
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
