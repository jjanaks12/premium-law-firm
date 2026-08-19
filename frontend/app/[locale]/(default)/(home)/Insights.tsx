"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAxios } from "@/lib/services/axios.service";
import { Link } from "@/src/i18n/routing";
import InsightCard from "../insight/Card";
import { getFileUrl } from "@/lib/utils";

export default function Insights() {
  const t = useTranslations("Insights");
  const { axios } = useAxios();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get("/pages/public/insights?take=3");
        if (res.data?.data) {
          setPosts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [axios]);

  return (
    <section id="insights" className="py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="mt-4 text-4xl md:text-5xl text-navy-deep">
              {t("title")}
            </h2>
            <span className="gold-rule mt-6" />
          </div>
          <Link
            href="/insight"
            className="text-sm tracking-[0.2em] uppercase text-navy hover:text-gold transition-colors inline-flex items-center gap-2"
          >
            {t("allArticles")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-10">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-4/3 rounded-lg bg-muted/40 animate-pulse"
              />
            ))
          ) : posts.length > 0 ? (
            posts.map((p: any) => <InsightCard key={p.id} page={p} />)
          ) : (
            <div className="col-span-3 py-10 text-center text-muted-foreground">
              <p>{t("noInsights") || "No insights available."}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
