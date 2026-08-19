import { Link } from "@/src/i18n/routing";
import { Page, PageType, Resource } from "@prisma/generated/client";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { getFileUrl } from "@/lib/utils";

export default function InsightCard({
  page,
}: {
  page: Page & { thumbnail: Resource; page_type: PageType };
}) {
  const t = useTranslations("Insights");

  return (
    <article key={page.id} className="group cursor-pointer">
      {page.thumbnail && (
        <Link href={`/insight/${page.slug}`} className="block">
          <figure className="overflow-hidden aspect-4/3 bg-muted">
            <img
              src={getFileUrl(page.thumbnail?.url)}
              alt={page.thumbnail?.description ?? page.title}
              loading="lazy"
              width={1024}
              height={1024}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </figure>
        </Link>
      )}
      <div className="pt-6">
        <div className="flex items-center gap-3 text-xs tracking-[0.18em] uppercase">
          <span className="text-gold">
            {page.page_type?.name || "Insights"}
          </span>
          <span className="h-1 w-1 bg-muted-foreground/50 rounded-full" />
          <span className="text-muted-foreground">
            {new Date(page.created_at).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <Link href={`/insight/${page.slug}`} className="block">
          <h3 className="mt-4 font-serif text-2xl leading-snug text-navy-deep group-hover:text-navy transition-colors">
            {page.title}
          </h3>
        </Link>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {page.excerpt || "Read more about this article."}
        </p>
        <Link
          href={`/insight/${page.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-navy group-hover:text-gold transition-colors"
        >
          {t("readMore")} <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
