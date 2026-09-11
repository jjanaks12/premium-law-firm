import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAxios } from "@/lib/services/axios.service";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon, LinkIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaseFileTabProps {
  caseData: any;
  refresh: () => void;
}

export default function CaseFileTab({ caseData, refresh }: CaseFileTabProps) {
  const { axios } = useAxios();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const initialFileType =
    caseData.documents?.find(
      (d: any) => d.documentUrl === (caseData.facts || ""),
    )?.fileName === "Failsala"
      ? "failsala"
      : "aadesh";
  const [fileType, setFileType] = useState(initialFileType);
  const [facts, setFacts] = useState(caseData.facts || "");
  const [details, setDetails] = useState<string[]>(
    Array.isArray(caseData.details) ? caseData.details : [],
  );
  const [relatedLaw, setRelatedLaw] = useState<
    { number: string; parties: string[] }[]
  >(Array.isArray(caseData.relatedLaw) ? caseData.relatedLaw : []);

  const addDetail = () => setDetails([...details, ""]);
  const updateDetail = (idx: number, val: string) => {
    const newDetails = [...details];
    newDetails[idx] = val;
    setDetails(newDetails);
  };
  const removeDetail = (idx: number) => {
    const newDetails = [...details];
    newDetails.splice(idx, 1);
    setDetails(newDetails);
  };

  const addLaw = () =>
    setRelatedLaw([...relatedLaw, { number: "", parties: [] }]);
  const updateLawNumber = (idx: number, val: string) => {
    const newLaws = [...relatedLaw];
    newLaws[idx].number = val;
    setRelatedLaw(newLaws);
  };
  const toggleLawParty = (idx: number, partyId: string) => {
    const newLaws = [...relatedLaw];
    const parties = newLaws[idx].parties;
    if (parties.includes(partyId)) {
      newLaws[idx].parties = parties.filter((p) => p !== partyId);
    } else {
      newLaws[idx].parties = [...parties, partyId];
    }
    setRelatedLaw(newLaws);
  };
  const removeLaw = (idx: number) => {
    const newLaws = [...relatedLaw];
    newLaws.splice(idx, 1);
    setRelatedLaw(newLaws);
  };

  const handleFactFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const fileName = fileType === "failsala" ? "Failsala" : "Aadesh";
    formData.append("fileName", fileName);

    try {
      const { data } = await axios.post(
        `/cases/${caseData.id}/documents`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (data.data && data.data.documentUrl) {
        setFacts(data.data.documentUrl);
        toast.add({
          description: "Document uploaded successfully",
          type: "success",
        });
      }
    } catch (err) {
      toast.add({ description: "Upload failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    try {
      const payload: any = {
        facts,
        details,
        relatedLaw,
      };
      if (fileType === "failsala" && facts) {
        payload.status = "Closed";
      }

      await axios.put(`/cases/${caseData.id}`, payload);
      toast.add({
        description: t("CaseFileTab.successMsg"),
        type: "success",
      });
      refresh();
    } catch (error) {
      toast.add({
        description: t("CaseFileTab.errorMsg"),
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
          <CardTitle>{t("CaseFileTab.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Label>{t("CaseFileTab.fileType") || "File Type"}</Label>
              <Select
                value={fileType}
                onValueChange={(a: any) => setFileType(a as any)}
              >
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadesh">Aadesh</SelectItem>
                  <SelectItem value="failsala">Failsala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Label>{t("CaseFileTab.facts")}</Label>
            {facts &&
            (facts.startsWith("/uploads/") || facts.startsWith("http")) ? (
              <div className="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-all">
                <a
                  href={
                    facts.startsWith("/")
                      ? process.env.NEXT_PUBLIC_API_URL + facts
                      : facts
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline flex items-center"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  View Uploaded Facts Document
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => setFacts("")}
                  disabled={loading}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ) : facts ? (
              <div className="flex items-start space-x-2 p-4 border rounded-xl bg-card hover:shadow-sm transition-all">
                <div className="flex-1 text-sm whitespace-pre-wrap">
                  {facts}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                  onClick={() => setFacts("")}
                  disabled={loading}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Input type="file" onChange={(e) => handleFactFileUpload(e)} />
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t("CaseFileTab.details")}
              </Label>
              <Button
                variant="secondary"
                size="sm"
                onClick={addDetail}
                className="rounded-full"
              >
                <PlusIcon className="w-4 h-4 mr-2" />{" "}
                {t("CaseFileTab.addDetail")}
              </Button>
            </div>
            {details.map((detail, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 group relative"
              >
                <div className="flex-1">
                  <Textarea
                    value={detail}
                    onChange={(e) => updateDetail(idx, e.target.value)}
                    placeholder={`${t("CaseFileTab.detailPlaceholder")} ${idx + 1}`}
                    rows={2}
                    className="resize-none bg-card focus:bg-background transition-colors rounded-xl"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDetail(idx)}
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t("CaseFileTab.relatedLaws")}
              </Label>
              <Button
                variant="secondary"
                size="sm"
                onClick={addLaw}
                className="rounded-full"
              >
                <PlusIcon className="w-4 h-4 mr-2" /> {t("CaseFileTab.addLaw")}
              </Button>
            </div>
            {relatedLaw.map((law, idx) => (
              <div
                key={idx}
                className="border bg-card p-5 rounded-2xl space-y-5 hover:shadow-md transition-shadow relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Label className="text-xs uppercase text-muted-foreground mb-1 block">
                      {t("CaseFileTab.decisionNumber")}
                    </Label>
                    <Input
                      className="max-w-md bg-background"
                      value={law.number}
                      onChange={(e) => updateLawNumber(idx, e.target.value)}
                      placeholder={t("CaseFileTab.decisionNumber")}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLaw(idx)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>{t("CaseFileTab.relatedParties")}</Label>
                  <div className="flex flex-wrap gap-4">
                    {caseData.parties?.map((party: any) => (
                      <div
                        key={party.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`law-${idx}-party-${party.id}`}
                          checked={law.parties.includes(party.id)}
                          onCheckedChange={() => toggleLawParty(idx, party.id)}
                        />
                        <Label htmlFor={`law-${idx}-party-${party.id}`}>
                          {party.partyName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={save} disabled={loading}>
              {loading ? t("CaseFileTab.saving") : t("CaseFileTab.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
