"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/routing";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import CaseForm from "../CaseForm";

export default function CreateCasePage() {
  const t = useTranslations("CasesPage");
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/cases");
  };

  const handleClose = () => {
    router.push("/dashboard/cases");
  };

  return (
    <div className="flex h-full w-full flex-col p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("addModalTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">Create a new case</p>
        </div>
      </div>
      <div className="bg-card border rounded-lg p-6">
        <CaseForm
          isEditing={false}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
