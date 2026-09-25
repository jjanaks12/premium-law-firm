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
import { getFileUrl } from "@/lib/utils";

interface FactsDocument {
  id: string;
  fileName: string;
  documentUrl: string;
  documentType?: string | null;
}

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
  const [factsDocuments, setFactsDocuments] = useState<FactsDocument[]>(
    () => (caseData.documents || []).filter(
      (document: FactsDocument) => document.documentType === "MisilFacts",
    ),
  );
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
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || loading) return;

    setLoading(true);
    const failedFiles: string[] = [];
    let uploadedCount = 0;
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("documentType", "MisilFacts");
        try {
          const { data } = await axios.post(
            `/cases/${caseData.id}/documents`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
          if (!data.data?.id || !data.data?.documentUrl) {
            throw new Error("Missing uploaded document");
          }
          setFactsDocuments((documents) => [...documents, data.data]);
          uploadedCount++;
        } catch {
          failedFiles.push(file.name);
        }
      }
      if (uploadedCount) {
        toast.add({
          description: t("CaseFileTab.filesUploaded", { count: uploadedCount }),
          type: "success",
        });
        refresh();
      }
      if (failedFiles.length) {
        toast.add({
          description: t("CaseFileTab.filesFailed", { names: failedFiles.join(", ") }),
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFactsDocument = async (document: FactsDocument) => {
    setLoading(true);
    try {
      await axios.delete(`/cases/${caseData.id}/documents/${document.id}`);
      setFactsDocuments((documents) => documents.filter((item) => item.id !== document.id));
      refresh();
    } catch {
      toast.add({ description: t("CaseFileTab.removeFailed"), type: "error" });
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
            <Label>{t("CaseFileTab.facts")}</Label>
            {facts &&
            (facts.startsWith("/uploads/") || facts.startsWith("http")) ? (
              <div className="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-all">
                <a
                  href={getFileUrl(facts)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline flex items-center"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {caseData.documents?.find((document: FactsDocument) => document.documentUrl === facts)?.fileName || t("CaseFileTab.viewFactsDocument")}
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
            ) : null}
            {factsDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 p-4 border rounded-xl bg-card">
                <a href={getFileUrl(document.documentUrl)} target="_blank" rel="noopener noreferrer"
                  className="min-w-0 text-primary font-medium hover:underline flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span className="break-all">{document.fileName}</span>
                </a>
                <Button variant="ghost" size="icon" disabled={loading}
                  className="shrink-0 text-destructive hover:bg-destructive/10 rounded-full"
                  aria-label={t("CaseFileTab.removeFile", { name: document.fileName })}
                  onClick={() => removeFactsDocument(document)}>
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Input type="file" multiple onChange={handleFactFileUpload} disabled={loading}
              aria-label={t("CaseFileTab.addFiles")} aria-describedby="misil-upload-help" />
            <p id="misil-upload-help" className="text-sm text-muted-foreground" aria-live="polite">
              {loading ? t("CaseFileTab.saving") : t("CaseFileTab.multipleFilesHelp")}
            </p>
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
