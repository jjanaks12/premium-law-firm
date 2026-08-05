"use client";

import { useState, useEffect } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";
import MediaLibraryDialog from "@/components/MediaLibraryDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface PageType {
  id: string;
  name: string;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  detail?: any;
  excerpt: string | null;
  status: string;
  locale: string;
  parent_id: string | null;
  page_type: PageType | null;
  thumbnail: { id: string; url: string } | null;
  seo: {
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_title: string | null;
    og_description: string | null;
    canonical_url: string | null;
    robots: string | null;
  } | null;
  schema: {
    schema_type: string | null;
    schema_data: any | null;
  } | null;
}

interface Props {
  initialData?: Page;
  pageTypes: PageType[];
  isEditing: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PageForm({
  initialData,
  pageTypes,
  isEditing,
  onSuccess,
  onCancel,
}: Props) {
  const t = useTranslations("PageForm");
  const { axios } = useAxios();
  const [loading, setLoading] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  // --- Page fields ---
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [locale, setLocale] = useState(initialData?.locale ?? "en");
  const [pageTypeId, setPageTypeId] = useState(
    initialData?.page_type?.id ?? "",
  );
  const [parentId, setParentId] = useState(initialData?.parent_id ?? "");
  const [thumbnail, setThumbnail] = useState<{
    id: string;
    url: string;
  } | null>(initialData?.thumbnail ?? null);
  const [content, setContent] = useState(initialData?.content ?? "");

  // --- SEO fields ---
  const [metaTitle, setMetaTitle] = useState(
    initialData?.seo?.meta_title ?? "",
  );
  const [metaDescription, setMetaDescription] = useState(
    initialData?.seo?.meta_description ?? "",
  );
  const [metaKeywords, setMetaKeywords] = useState(
    initialData?.seo?.meta_keywords ?? "",
  );
  const [ogTitle, setOgTitle] = useState(initialData?.seo?.og_title ?? "");
  const [ogDescription, setOgDescription] = useState(
    initialData?.seo?.og_description ?? "",
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    initialData?.seo?.canonical_url ?? "",
  );
  const [robots, setRobots] = useState(
    initialData?.seo?.robots ?? "index,follow",
  );

  // --- Schema.org fields ---
  const [schemaType, setSchemaType] = useState(
    initialData?.schema?.schema_type ?? "",
  );
  const [schemaData, setSchemaData] = useState(
    initialData?.schema?.schema_data
      ? JSON.stringify(initialData.schema.schema_data, null, 2)
      : "",
  );

  // Auto-generate slug from title (create mode only)
  useEffect(() => {
    if (!isEditing && title) {
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-"),
      );
    }
  }, [title, isEditing]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const pagePayload = {
        slug,
        title,
        excerpt: excerpt || null,
        locale,
        page_type_id: pageTypeId || null,
        parent_id: parentId || null,
        thumbnail_id: thumbnail?.id ?? null,
        content: content || "",
      };

      let pageId = initialData?.id;

      if (isEditing && pageId) {
        await axios.put(`/pages/${pageId}`, pagePayload);
      } else {
        const { data } = await axios.post("/pages", pagePayload);
        pageId = data.data.id;
      }

      // Upsert SEO
      if (pageId) {
        await axios.put(`/pages/${pageId}/seo`, {
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          meta_keywords: metaKeywords || null,
          og_title: ogTitle || null,
          og_description: ogDescription || null,
          canonical_url: canonicalUrl || null,
          robots: robots || null,
        });

        // Upsert Schema
        if (schemaType || schemaData) {
          await axios.put(`/pages/${pageId}/schema`, {
            schema_type: schemaType || null,
            schema_data: (() => {
              try {
                return schemaData ? JSON.parse(schemaData) : null;
              } catch {
                return null;
              }
            })(),
          });
        }
      }

      toast.add({
        title: t("success"),
        description: isEditing ? t("pageUpdated") : t("pageCreated"),
        type: "success",
      });
      onSuccess();
    } catch (err: any) {
      toast.add({
        title: t("error"),
        description:
          err.response?.data?.message || err.message || t("operationFailed"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full";

  return (
    <div className="space-y-4">
      <Tabs defaultValue="content">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="content" className="flex-1">
            {t("tabs.content")}
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex-1">
            {t("tabs.seo")}
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex-1">
            {t("tabs.schema")}
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 mt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("locale")}</Label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className={inputClass}
              >
                <option value="en">{t("english")}</option>
                <option value="ne">{t("nepali")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("pageType")}</Label>
              <select
                value={pageTypeId}
                onChange={(e) => setPageTypeId(e.target.value)}
                className={inputClass}
              >
                <option value="">{t("none")}</option>
                {pageTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              {t("title")} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("pageTitlePlaceholder")}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              {t("slug")} <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">/</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t("slugPlaceholder")}
                className="rounded-lg font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("excerpt")}</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={t("excerptPlaceholder")}
              rows={2}
              className="rounded-lg resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("content")}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder=""
              rows={6}
              className="rounded-lg font-mono text-xs resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {t("contentHint")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>{t("thumbnail")}</Label>
            <div className="flex items-center gap-3">
              {thumbnail ? (
                <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0">
                  <img
                    src={thumbnail.url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnail(null)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs flex items-center justify-center"
                  >
                    {t("remove")}
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground shrink-0">
                  {t("noImage")}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setMediaOpen(true)}
              >
                {thumbnail ? t("changeImage") : t("selectMedia")}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("parentPageId")}</Label>
            <Input
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              placeholder={t("leaveBlankForRoot")}
              className="rounded-lg font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t("parentPageIdHint")}
            </p>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4 mt-0">
          <div className="space-y-1.5">
            <Label>{t("metaTitle")}</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder=""
              className="rounded-lg"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50–60 characters
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("metaDescription")}</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder=""
              rows={3}
              className="rounded-lg resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 120–160 characters
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{t("metaKeywords")}</Label>
            <Input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder=""
              className="rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("ogTitle")}</Label>
              <Input
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder=""
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("canonicalUrl")}</Label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder=""
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("ogDescription")}</Label>
            <Textarea
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder=""
              rows={2}
              className="rounded-lg resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("robots")}</Label>
            <select
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              className={inputClass}
            >
              <option value="index,follow">{t("indexFollow")}</option>
              <option value="noindex,follow">{t("noindexFollow")}</option>
              <option value="index,nofollow">{t("indexNofollow")}</option>
              <option value="noindex,nofollow">{t("noindexNofollow")}</option>
            </select>
          </div>
        </TabsContent>

        {/* Schema.org Tab */}
        <TabsContent value="schema" className="space-y-4 mt-0">
          <div className="space-y-1.5">
            <Label>{t("schemaType")}</Label>
            <select
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("none")}</option>
              <option value="WebPage">WebPage</option>
              <option value="AboutPage">AboutPage</option>
              <option value="ContactPage">ContactPage</option>
              <option value="FAQPage">FAQPage</option>
              <option value="LegalService">LegalService</option>
              <option value="Service">Service</option>
              <option value="Article">Article</option>
              <option value="BreadcrumbList">BreadcrumbList</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("schemaPayload")}</Label>
            <Textarea
              value={schemaData}
              onChange={(e) => setSchemaData(e.target.value)}
              rows={10}
              className="rounded-lg font-mono text-xs resize-y"
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "LegalService",\n  "name": "Premium Law Firm"\n}`}
            />
            <p className="text-xs text-muted-foreground">
              This JSON-LD will be injected as{" "}
              <code className="bg-muted px-1 rounded text-xs">
                {'<script type="application/ld+json">'}
              </code>{" "}
              in the page's{" "}
              <code className="bg-muted px-1 rounded text-xs">{"<head>"}</code>.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t("saveChanges") : t("createPage")}
        </Button>
      </div>

      <MediaLibraryDialog
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        getFileUrl={(url) => {
          if (url.startsWith("http")) return url;
          const host = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
            "/api/v1",
            "",
          );
          return `${host}${url}`;
        }}
        onSelect={(url, id) => {
          const host = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
            "/api/v1",
            "",
          );
          const fullUrl = url.startsWith("http") ? url : `${host}${url}`;
          setThumbnail({ id, url: fullUrl });
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
