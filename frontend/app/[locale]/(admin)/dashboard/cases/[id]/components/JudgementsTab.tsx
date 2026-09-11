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
import { CompositeDatePicker } from "@/components/ui/composite-date-picker";
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
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle>{t("JudgementsTab.history")}</CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.judgements?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed rounded-xl bg-muted/5">
              <div className="bg-muted p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">{t("JudgementsTab.noJudgements")}</h3>
              <p className="text-sm text-muted-foreground mb-2 max-w-sm">
                No judgements have been recorded for this case yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {caseData.judgements?.map((j: any) => (
                <div key={j.id} className="border bg-card shadow-sm rounded-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted/10 p-3 rounded-xl border border-transparent hover:border-border transition-colors">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                        {t("JudgementsTab.type")}
                      </span>
                      <span className="font-semibold text-primary">{j.type}</span>
                    </div>
                    <div className="bg-muted/10 p-3 rounded-xl border border-transparent hover:border-border transition-colors">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                        {t("JudgementsTab.date")}
                      </span>
                      <span className="font-medium">
                        {j.date ? format(new Date(j.date), "PPP") : "-"}
                      </span>
                    </div>
                    <div className="bg-muted/10 p-3 rounded-xl border border-transparent hover:border-border transition-colors">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                        {t("JudgementsTab.verifiedDate")}
                      </span>
                      <span className="font-medium">
                        {j.verifiedDate
                          ? format(new Date(j.verifiedDate), "PPP")
                          : "-"}
                      </span>
                    </div>
                    <div className="bg-muted/10 p-3 rounded-xl border border-transparent hover:border-border transition-colors">
                      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                        {t("JudgementsTab.court")}
                      </span>
                      <span className="font-medium">{j.caseCourtDetail?.courtType}</span>
                    </div>
                  </div>
                  {j.detail &&
                    Array.isArray(j.detail) &&
                    j.detail.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                          {t("JudgementsTab.details")}
                        </h4>
                        <ul className="space-y-3">
                          {j.detail.map((d: any, idx: number) => (
                            <li key={idx} className="bg-muted/5 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <p className="text-sm italic text-muted-foreground">"{d.detailText}"</p>
                              {d.document && (
                                <a
                                  href={d.document.startsWith('http') ? d.document : `${process.env.NEXT_PUBLIC_API_URL || ''}${d.document.startsWith('/') ? '' : '/'}${d.document}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 shrink-0"
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
                <CompositeDatePicker
                  value={date}
                  onChange={(val) => setDate(val)}
                  showTime={false}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("JudgementsTab.verifiedDate")}</Label>
                <CompositeDatePicker
                  value={verifiedDate}
                  onChange={(val) => setVerifiedDate(val)}
                  showTime={false}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{t("JudgementsTab.details")}</Label>
                <Button variant="secondary" size="sm" onClick={addDetail} className="rounded-full">
                  <PlusIcon className="w-4 h-4 mr-2" />{" "}
                  {t("JudgementsTab.addDetail")}
                </Button>
              </div>

              {details.map((d, idx) => (
                <div
                  key={d.id}
                  className="flex flex-col md:flex-row gap-4 items-start border bg-muted/5 p-5 rounded-2xl relative group hover:border-primary/30 transition-colors"
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
                    className="mt-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full md:opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 md:relative md:top-0 md:right-0"
                  >
                    <Trash2Icon className="w-4 h-4" />
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
