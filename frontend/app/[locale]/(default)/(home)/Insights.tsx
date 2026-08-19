"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAxios } from "@/lib/services/axios.service";

export default function Insights() {
  const t = useTranslations("Insights");
  const { axios } = useAxios();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get('/pages/public/insights');
        if (res.data?.data) {
          setPosts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
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
          <a
            href="#"
            className="text-sm tracking-[0.2em] uppercase text-navy hover:text-gold transition-colors inline-flex items-center gap-2"
          >
            {t("allArticles")} <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-10">
          {posts.map((p: any) => (
            <article key={p.id} className="group cursor-pointer">
              <div className="overflow-hidden aspect-4/3 bg-muted">
                <img
                  src={p.thumbnail?.url || "/images/blog-1.jpg"}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="pt-6">
                <div className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase">
                  <span className="text-gold">{p.page_type?.name || "Insights"}</span>
                  <span className="h-1 w-1 bg-muted-foreground/50 rounded-full" />
                  <span className="text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl leading-snug text-navy-deep group-hover:text-navy transition-colors">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {p.excerpt || "Read more about this article."}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-navy group-hover:text-gold transition-colors">
                  {t("readMore")} <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
