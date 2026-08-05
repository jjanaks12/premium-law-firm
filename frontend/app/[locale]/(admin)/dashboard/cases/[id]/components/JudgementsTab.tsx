import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAxios } from "@/lib/services/axios.service";
import { useTranslations } from "next-intl";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { format } from "date-fns";

interface JudgementsTabProps {
  caseData: any;
  refresh: () => void;
  isClosed: boolean;
}

export default function JudgementsTab({
  caseData,
  refresh,
  isClosed,
}: JudgementsTabProps) {
  const { axios } = useAxios();
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Closed");
  const [date, setDate] = useState("");
  const [verifiedDate, setVerifiedDate] = useState("");

  const [details, setDetails] = useState<
    { id: string; document: string; detailText: string }[]
  >([]);

  const activeCourtDetail =
    caseData.courtDetails?.find((c: any) => c.isActive) ||
    caseData.courtDetails?.[caseData.courtDetails.length - 1];

  const addDetail = () => {
    setDetails([
      ...details,
      { id: Date.now().toString(), document: "", detailText: "" },
    ]);
  };

  const updateDetail = (idx: number, field: string, value: string) => {
    const newDetails = [...details];
    newDetails[idx] = { ...newDetails[idx], [field]: value };
    setDetails(newDetails);
  };

  const removeDetail = (idx: number) => {
    const newDetails = [...details];
    newDetails.splice(idx, 1);
    setDetails(newDetails);
  };

  const save = async () => {
    if (!activeCourtDetail) return;
    setLoading(true);
    try {
      await axios.post(`/cases/${caseData.id}/judgements`, {
        caseCourtDetailId: activeCourtDetail.id,
        type,
        date: date || null,
        verifiedDate: verifiedDate || null,
        detail: details,
      });
      toast.add({
        description: t("JudgementsTab.successMsg"),
        type: "success",
      });
      // Reset form
      setType("Closed");
      setDate("");
      setVerifiedDate("");
      setDetails([]);
      refresh();
    } catch (error) {
      toast.add({
        description: t("JudgementsTab.errorMsg"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("JudgementsTab.history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.judgements?.length === 0 ? (
            <p className="text-muted-foreground">
              {t("JudgementsTab.noJudgements")}
            </p>
          ) : (
            <div className="space-y-4">
              {caseData.judgements?.map((j: any) => (
                <div key={j.id} className="border p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-semibold">
                        {t("JudgementsTab.type")}:{" "}
                      </span>
                      <span>{j.type}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">
                        {t("JudgementsTab.date")}:{" "}
                      </span>
                      <span>
                        {j.date ? format(new Date(j.date), "PPP") : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">
                        {t("JudgementsTab.verifiedDate")}:{" "}
                      </span>
                      <span>
                        {j.verifiedDate
                          ? format(new Date(j.verifiedDate), "PPP")
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">
                        {t("JudgementsTab.court")}:{" "}
                      </span>
                      <span>{j.caseCourtDetail?.courtType}</span>
                    </div>
                  </div>
                  {j.detail &&
                    Array.isArray(j.detail) &&
                    j.detail.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">
                          {t("JudgementsTab.details")}
                        </h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {j.detail.map((d: any, idx: number) => (
                            <li key={idx} className="text-sm">
                              <p>{d.detailText}</p>
                              {d.document && (
                                <a
                                  href={d.document.startsWith('http') ? d.document : `${process.env.NEXT_PUBLIC_API_URL || ''}${d.document.startsWith('/') ? '' : '/'}${d.document}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {t("JudgementsTab.viewDocument")}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!isClosed && (
        <Card>
          <CardHeader>
            <CardTitle>{t("JudgementsTab.addJudgement")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("JudgementsTab.type")}</Label>
                <Select
                  value={type}
                  onValueChange={(val) => setType(val as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Closed">
                      {t("JudgementsTab.typeClosed")}
                    </SelectItem>
                    <SelectItem value="Next Court Appeal">
                      {t("JudgementsTab.typeAppeal")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("JudgementsTab.date")}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("JudgementsTab.verifiedDate")}</Label>
                <Input
                  type="date"
                  value={verifiedDate}
                  onChange={(e) => setVerifiedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label>{t("JudgementsTab.details")}</Label>
                <Button variant="outline" size="sm" onClick={addDetail}>
                  <PlusIcon className="w-4 h-4 mr-2" />{" "}
                  {t("JudgementsTab.addDetail")}
                </Button>
              </div>

              {details.map((d, idx) => (
                <div
                  key={d.id}
                  className="flex gap-2 items-start border p-4 rounded-md relative"
                >
                  <div className="flex-1 space-y-2">
                    <Label>{t("JudgementsTab.detailText")}</Label>
                    <Input
                      value={d.detailText}
                      onChange={(e) =>
                        updateDetail(idx, "detailText", e.target.value)
                      }
                      placeholder={t("JudgementsTab.detailTextPlaceholder")}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>{t("JudgementsTab.documentUrl")}</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={d.document}
                        onChange={(e) =>
                          updateDetail(idx, "document", e.target.value)
                        }
                        placeholder={t("JudgementsTab.documentUrlPlaceholder")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const { data } = await axios.post(
                                "/resources/upload",
                                formData,
                                {
                                  headers: {
                                    "Content-Type": "multipart/form-data",
                                  },
                                }
                              );
                              updateDetail(idx, "document", data.data.url);
                              toast.add({
                                description: "File uploaded successfully",
                                type: "success",
                              });
                            } catch (error) {
                              toast.add({
                                description: "File upload failed",
                                type: "error",
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDetail(idx)}
                    className="mt-6"
                  >
                    <Trash2Icon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={save} disabled={loading}>
                {loading ? t("JudgementsTab.saving") : t("JudgementsTab.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
