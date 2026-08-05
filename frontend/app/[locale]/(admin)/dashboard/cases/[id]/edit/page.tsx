"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useAxios } from "@/lib/services/axios.service";
import CaseForm from "../../CaseForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2Icon } from "lucide-react";
import { useRouter as useI18nRouter } from "@/src/i18n/routing";

export default function EditCasePage() {
  const t = useTranslations("CasesPage");
  const router = useI18nRouter();
  const params = useParams();
  const id = params.id as string;
  const { axios } = useAxios();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const { data } = await axios.get(`/cases/${id}`);
        setCaseData(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCase();
  }, [id]);

  const handleSuccess = () => {
    router.push("/dashboard/cases");
  };

  const handleClose = () => {
    router.push("/dashboard/cases");
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("editModalTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">Update case details</p>
        </div>
      </div>
      <div className="bg-card border rounded-lg p-6">
        <CaseForm
          isEditing={true}
          caseData={caseData}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
