"use client";

import { useEffect, useState, use } from "react";
import { useAxios } from "@/lib/services/axios.service";
import PageForm from "../../PageForm";
import { useRouter } from "@/src/i18n/routing";
import { ChevronLeftIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const { axios } = useAxios();
  const router = useRouter();
  
  const [pageTypes, setPageTypes] = useState([]);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        // Fetch page types and the page data in parallel
        const [typesRes, pageRes] = await Promise.all([
          axios.get("/pages/page-types").catch(() => ({ data: { success: false, data: [] } })),
          axios.get(`/pages/${id}`)
        ]);

        if (typesRes.data?.success) {
          setPageTypes(typesRes.data.data);
        }
        
        if (pageRes.data?.success) {
          setInitialData(pageRes.data.data);
        } else {
          throw new Error("Failed to load page");
        }
      } catch (err: any) {
        toast.add({
          title: "Error",
          description: err.message || "Failed to load page data",
          type: "error",
        });
        router.push("/dashboard/pages");
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [axios, id, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/pages")}>
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-2">
            Edit Page
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update content and settings for this page
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading page data…</span>
          </div>
        ) : (
          <PageForm
            initialData={initialData}
            pageTypes={pageTypes}
            isEditing={true}
            onSuccess={() => router.push("/dashboard/pages")}
            onCancel={() => router.push("/dashboard/pages")}
          />
        )}
      </div>
    </div>
  );
}
