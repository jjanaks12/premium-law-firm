import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAxios } from "@/lib/services/axios.service";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface CaseFileTabProps {
  caseData: any;
  refresh: () => void;
}

export default function CaseFileTab({ caseData, refresh }: CaseFileTabProps) {
  const { axios } = useAxios();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

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

  const save = async () => {
    setLoading(true);
    try {
      await axios.put(`/cases/${caseData.id}`, {
        facts,
        details,
        relatedLaw,
      });
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
          <div className="space-y-2">
            <Label>{t("CaseFileTab.facts")}</Label>
            <Textarea
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              placeholder={t("CaseFileTab.enterFacts")}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("CaseFileTab.details")}</Label>
              <Button variant="outline" size="sm" onClick={addDetail}>
                <PlusIcon className="w-4 h-4 mr-2" /> {t("CaseFileTab.addDetail")}
              </Button>
            </div>
            {details.map((detail, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Textarea
                  value={detail}
                  onChange={(e) => updateDetail(idx, e.target.value)}
                  placeholder={`${t("CaseFileTab.detailPlaceholder")} ${idx + 1}`}
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDetail(idx)}
                >
                  <Trash2Icon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t("CaseFileTab.relatedLaws")}</Label>
              <Button variant="outline" size="sm" onClick={addLaw}>
                <PlusIcon className="w-4 h-4 mr-2" /> {t("CaseFileTab.addLaw")}
              </Button>
            </div>
            {relatedLaw.map((law, idx) => (
              <div key={idx} className="border p-4 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <Input
                    className="max-w-md"
                    value={law.number}
                    onChange={(e) => updateLawNumber(idx, e.target.value)}
                    placeholder={t("CaseFileTab.decisionNumber")}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLaw(idx)}
                  >
                    <Trash2Icon className="w-4 h-4 text-red-500" />
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
