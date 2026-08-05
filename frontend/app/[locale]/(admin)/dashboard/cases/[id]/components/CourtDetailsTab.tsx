import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Edit2Icon, ArrowRightLeftIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CourtDetailsTab({
  caseData,
  refresh,
}: {
  caseData: any;
  refresh: () => void;
}) {
  const t = useTranslations("CasesPage");
  const locale = useLocale();
  const { axios } = useAxios();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courtLevels, setCourtLevels] = useState<any[]>([]);

  useEffect(() => {
    if (open && courtLevels.length === 0) {
      axios
        .get("/cases/meta/court-levels")
        .then((res) => setCourtLevels(res.data.data || []))
        .catch(console.error);
    }
  }, [open, courtLevels.length, axios]);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [caseName, setCaseName] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [sectionCourtRoom, setSectionCourtRoom] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [courtType, setCourtType] = useState("");
  const [courtName, setCourtName] = useState("");
  const [registrationDate, setRegistrationDate] = useState<Date | undefined>(
    undefined,
  );

  const activeDetail =
    caseData.courtDetails?.find((d: any) => d.isActive) ||
    caseData.courtDetails?.[0];

  const handleOpenEdit = (detail: any) => {
    setIsEditing(true);
    setEditId(detail.id);
    setCaseName(detail.caseName || "");
    setCaseNumber(detail.caseNumber || "");
    setSectionCourtRoom(detail.sectionCourtRoom || "");
    setJudgeName(detail.judgeName || "");
    setCourtType(detail.courtType || "");
    setCourtName(detail.courtName || "");
    setRegistrationDate(
      detail.registrationDate ? new Date(detail.registrationDate) : undefined,
    );
    setOpen(true);
  };

  const handleOpenTransfer = () => {
    setIsEditing(false);
    setEditId(null);
    setCaseName(activeDetail?.caseName || "");
    setCaseNumber(activeDetail?.caseNumber || "");
    setSectionCourtRoom("");
    setJudgeName("");
    setCourtType("");
    setCourtName("");
    setRegistrationDate(new Date());
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a copy of the current details
      let updatedDetails = [...(caseData.courtDetails || [])];

      if (isEditing) {
        // Update the existing detail
        updatedDetails = updatedDetails.map((d) => {
          if (d.id === editId) {
            return {
              ...d,
              caseName,
              caseNumber,
              sectionCourtRoom,
              judgeName,
              courtType,
              courtName,
              registrationDate: registrationDate
                ? dayjs(registrationDate).format("YYYY-MM-DD")
                : null,
            };
          }
          return d;
        });
      } else {
        // Set old active to false
        updatedDetails = updatedDetails.map((d) => ({ ...d, isActive: false }));
        // Push new active
        updatedDetails.push({
          caseName,
          caseNumber,
          sectionCourtRoom,
          judgeName,
          courtType,
          courtName,
          registrationDate: registrationDate
            ? dayjs(registrationDate).format("YYYY-MM-DD")
            : null,
          isActive: true,
          parentId: activeDetail?.id || null,
        });
      }

      await axios.patch(`/cases/${caseData.id}`, {
        courtDetails: updatedDetails,
      });

      toast.add({
        title: "Success",
        description: isEditing
          ? "Court detail updated"
          : "Case transferred successfully",
        type: "success",
      });

      setOpen(false);
      refresh();
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.response?.data?.message || "Action failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">{t("courtDetailsHistory")}</h2>
        <Button onClick={handleOpenTransfer} size="sm">
          <ArrowRightLeftIcon className="w-4 h-4 mr-2" /> {t("transferCase")}
        </Button>
      </div>

      {caseData.courtDetails && caseData.courtDetails.length > 0 ? (
        caseData.courtDetails.map((detail: any, index: number) => (
          <Card
            key={detail.id || index}
            className={
              detail.isActive ? "border-primary shadow-sm" : "opacity-80"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center">
                {detail.caseName}
                {detail.isActive && caseData.status !== "Closed" && (
                  <Badge className="ml-2">{t("active")}</Badge>
                )}
              </CardTitle>
              {index == caseData.courtDetails.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(detail)}
                >
                  <Edit2Icon className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("formNumber")}
                  </p>
                  <p className="mt-1">{detail.caseNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("formRegDate")}
                  </p>
                  <p className="mt-1">
                    {detail.registrationDate
                      ? dayjs(detail.registrationDate).format("MMM DD, YYYY")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("formFaat")}
                  </p>
                  <p className="mt-1">{detail.sectionCourtRoom || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("courtType")}
                  </p>
                  <p className="mt-1">
                    {detail.courtType
                      ? t(detail.courtType) !== detail.courtType
                        ? t(detail.courtType)
                        : detail.courtType
                      : t("na")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("courtName")}
                  </p>
                  <p className="mt-1">{detail.courtName || t("na")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("judge")}
                  </p>
                  <p className="mt-1">{detail.judgeName || t("na")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {t("noCourtDetailsFound")}
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("editCourtDetail") : t("transferCaseToNewCourt")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>
                {t("formName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("formNumber")} <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("formFaat")}</Label>
              <Input
                value={sectionCourtRoom}
                onChange={(e) => setSectionCourtRoom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("judgeName")}</Label>
              <Input
                value={judgeName}
                onChange={(e) => setJudgeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("courtType")}</Label>
              <Select
                value={courtType}
                onValueChange={(val) => setCourtType(val as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCourtType")} />
                </SelectTrigger>
                <SelectContent>
                  {courtLevels.map((level) => (
                    <SelectItem key={level.id} value={level.name}>
                      {locale === "np" && level.nepaliName
                        ? level.nepaliName
                        : level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("courtName")}</Label>
              <Input
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>{t("formRegDate")}</Label>
              <DatePicker
                value={registrationDate}
                onChange={setRegistrationDate}
              />
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
              <Button type="submit" disabled={loading}>
                {loading ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
