"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import PageForm from "../PageForm";
import { useRouter } from "@/src/i18n/routing";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreatePage() {
  const { axios } = useAxios();
  const router = useRouter();
  const [pageTypes, setPageTypes] = useState([]);

  useEffect(() => {
    const fetchPageTypes = async () => {
      try {
        const { data } = await axios.get("/pages/page-types");
        if (data.success) setPageTypes(data.data);
      } catch (err: any) {
        // Silent fail for types on load
      }
    };
    fetchPageTypes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/pages")}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-2">
            Create Page
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new page to your website
          </p>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <PageForm
          pageTypes={pageTypes}
          isEditing={false}
          onSuccess={() => router.push("/dashboard/pages")}
          onCancel={() => router.push("/dashboard/pages")}
        />
      </div>
    </div>
  );
}
