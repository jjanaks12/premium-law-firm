"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAxios } from "@/lib/services/axios.service";
import { useTranslations } from "next-intl";
import OverviewTab from "./components/OverviewTab";
import CourtDetailsTab from "./components/CourtDetailsTab";
import PartiesTab from "./components/PartiesTab";
import HearingsTab from "./components/HearingsTab";
import ProceedingsTab from "./components/ProceedingsTab";
import PleadingsTab from "./components/PleadingsTab";
import PrecedentsTab from "./components/PrecedentsTab";
import PaymentsTab from "./components/PaymentsTab";
import DocumentsTab from "./components/DocumentsTab";
import { Link } from "@/src/i18n/routing";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { axios } = useAxios();
  const t = useTranslations();

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCase = async () => {
    try {
      const { data } = await axios.get(`/cases/${id}`);
      setCaseData(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-125">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseData) {
    return <div className="p-6">{t("CaseDetailPage.caseNotFound")}</div>;
  }

  const activeDetail = caseData?.courtDetails?.find((d: any) => d.isActive) || caseData?.courtDetails?.[0];

  return (
    <div className="flex flex-col h-full bg-background p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="grow">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("CaseDetailPage.caseTitle", { caseNumber: activeDetail?.caseNumber || "N/A" })}
          </h1>
          <p className="text-muted-foreground">{activeDetail?.caseName || "N/A"}</p>
        </div>
        <div className="shrink-0">
          <Link href={`/dashboard/cases/${id}/edit`}>
            <Button>{t("CasesPage.editBtn")}</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex-wrap w-full justify-start h-auto gap-2">
          <TabsTrigger value="overview">
            {t("CaseDetailPage.overview")}
          </TabsTrigger>
          <TabsTrigger value="courtDetails">
            {t("CaseDetailPage.courtDetails")}
          </TabsTrigger>
          <TabsTrigger value="parties">
            {t("CaseDetailPage.parties")}
          </TabsTrigger>
          <TabsTrigger value="hearings">
            {t("CaseDetailPage.hearings")}
          </TabsTrigger>
          <TabsTrigger value="proceedings">
            {t("CaseDetailPage.proceedings")}
          </TabsTrigger>
          <TabsTrigger value="pleadings">
            {t("CaseDetailPage.pleadings")}
          </TabsTrigger>
          <TabsTrigger value="precedents">
            {t("CaseDetailPage.precedents")}
          </TabsTrigger>
          <TabsTrigger value="payments">
            {t("CaseDetailPage.payments")}
          </TabsTrigger>
          <TabsTrigger value="documents">
            {t("CaseDetailPage.documents")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="courtDetails">
          <CourtDetailsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="parties">
          <PartiesTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="hearings">
          <HearingsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="proceedings">
          <ProceedingsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="pleadings">
          <PleadingsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="precedents">
          <PrecedentsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab caseData={caseData} refresh={fetchCase} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
