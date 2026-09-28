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
  const [posts, setPosts] = useState<Record<string, any[]>>({
    article: [],
    news: [],
    "video-blog": [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const categories = ["article", "news", "video-blog"];
        const responses = await Promise.all(
          categories.map((type) =>
            axios.get("/pages/public/insights", {
              params: { take: 3, type, locale },
            }),
          ),
        );
        setPosts(
          Object.fromEntries(
            categories.map((type, index) => [
              type,
              responses[index].data?.data ?? [],
            ]),
          ),
        );
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [axios, locale]);

  const sections = [
    { type: "article", title: t("articlesTitle") },
    { type: "news", title: t("newsTitle") },
    { type: "video-blog", title: t("videosTitle") },
  ];

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

        <div className="mt-16 space-y-20">
          {sections.map((section) => (
            <div key={section.type}>
              <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-serif text-3xl text-navy-deep">
                  {section.title}
                </h3>
                <Link
                  href="/insight"
                  className="text-xs tracking-[0.18em] uppercase text-navy hover:text-gold transition-colors"
                >
                  {t("viewCategory")}
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-10">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-4/3 rounded-lg bg-muted animate-pulse"
                    />
                  ))
                ) : posts[section.type].length > 0 ? (
                  posts[section.type].map((post: any) => (
                    <InsightCard key={post.id} page={post} />
                  ))
                ) : (
                  <p className="md:col-span-3 py-6 text-muted-foreground">
                    {t("noCategoryContent")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
