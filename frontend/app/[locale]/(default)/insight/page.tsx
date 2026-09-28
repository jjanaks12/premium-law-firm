"use client";

import { useEffect, useState } from "react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAxios } from "@/lib/services/axios.service";
import InsightCard from "./Card";
import { Page, PageType, Resource } from "@prisma/generated/client";

type Post = Page & { thumbnail: Resource | null; page_type: PageType | null };

export default function InsightPage() {
  const t = useTranslations("Insights");
  const locale = useLocale();
  const { axios } = useAxios();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    totalPages: 1,
    total: 0,
    page: 1,
    limit: 9,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 300);
    return () => clearTimeout(timer);
  }, [axios, locale, page, search, selectedType]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "9",
      });
      if (search) query.append("search", search);
      query.append("locale", locale);
      if (selectedType !== "all") query.append("type", selectedType);

      const res = await axios.get(`/pages/public/insights?${query.toString()}`);
      if (res.data?.data) {
        setPosts(res.data.data);
        if (res.data.meta) setMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: t("all") },
    { value: "article", label: t("articlesTitle") },
    { value: "news", label: t("newsTitle") },
    { value: "video-blog", label: t("videosTitle") },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 bg-white min-h-screen">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="eyebrow">{t("eyebrow")}</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-serif text-navy-deep">
              {t("title")}
            </h1>
            <p className="mt-6 text-muted-foreground text-lg">
              Stay updated with our latest articles, news, and insights.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchPlaceholder") || "Search insights..."}
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all bg-muted/30"
            />
          </div>
        </div>

        <div className="mb-12 flex flex-wrap gap-3" aria-label={t("filterByType")}>
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                setSelectedType(category.value);
                setPage(1);
              }}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                selectedType === category.value
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-white text-navy hover:border-gold hover:text-gold"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-muted-foreground">
              {t("loading") || "Loading..."}
            </span>
          </div>
        ) : (
          <>
            {posts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">
                  {t("noResults") || "No articles found matching your search."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-10">
                {posts.map((p: Post) => (
                  <InsightCard key={p.id} page={p} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <span className="text-sm font-medium">
                  {t("page") || "Page"} {page} {t("of") || "of"}{" "}
                  {meta.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page === meta.totalPages}
                  className="p-2 rounded-full border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
