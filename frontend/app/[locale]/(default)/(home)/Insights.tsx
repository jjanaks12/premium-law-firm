"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAxios } from "@/lib/services/axios.service";
import { Link } from "@/src/i18n/routing";
import InsightCard from "../insight/Card";

export default function Insights() {
  const t = useTranslations("Insights");
  const locale = useLocale();
  const { axios } = useAxios();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await axios.get("/pages/public/insights", {
          params: { take: 6, locale },
        });
        setPosts(data?.data ?? []);
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [axios, locale]);

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
            {t("viewAll")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-4/3 rounded-lg bg-muted animate-pulse"
              />
            ))
          ) : posts.length > 0 ? (
            posts.map((post: any) => (
              <InsightCard key={post.id} page={post} />
            ))
          ) : (
            <p className="md:col-span-2 lg:col-span-3 py-6 text-muted-foreground">
              {t("noInsights")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
