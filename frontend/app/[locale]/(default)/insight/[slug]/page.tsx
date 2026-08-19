"use client";

import { useEffect, useState, use } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { Page, PageType, Resource, User } from "@prisma/generated/client";
import { Link, useRouter } from "@/src/i18n/routing";
import { ChevronLeftIcon, Loader2Icon, PlayIcon } from "lucide-react";
import { getFileUrl } from "@/lib/utils";

type Post = Page & { thumbnail: Resource; page_type: PageType; author: User };

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { axios } = useAxios();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await axios.get(`/pages/public/insights/${slug}`);
        if (res.data?.success) {
          setPost(res.data.data);
        } else {
          router.push("/insight");
        }
      } catch (err) {
        console.error("Failed to fetch insight:", err);
        router.push("/insight");
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [axios, slug, router]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 md:pt-40 md:pb-32 bg-white min-h-screen flex items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!post) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32 bg-white min-h-screen">
      <div className="container-x max-w-4xl">
        <Link
          href="/insight"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy transition-colors mb-8 group"
        >
          <ChevronLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Insights
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm tracking-[0.18em] uppercase mb-6">
            <span className="text-gold font-medium">
              {post.page_type?.name || "Insights"}
            </span>
            <span className="h-1 w-1 bg-muted-foreground/50 rounded-full" />
            <span className="text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-navy-deep leading-tight">
            {post.title}
          </h1>

          {post.author && (
            <div className="mt-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-navy font-serif text-lg">
                {post.author.first_name?.charAt(0) || "A"}
              </div>
              <div>
                <p className="text-sm font-medium text-navy-deep">
                  {post.author.first_name} {post.author.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Premium Law Firm
                </p>
              </div>
            </div>
          )}
        </header>

        {(() => {
          const videoUrl =
            post.detail &&
            typeof post.detail === "object" &&
            !Array.isArray(post.detail)
              ? (post.detail as any).videoUrl
              : null;

          const hasThumbnail = !!post.thumbnail;

          if (videoUrl && !isPlayingVideo && hasThumbnail) {
            return (
              <figure
                className="relative mb-12 rounded-xl overflow-hidden aspect-video bg-muted group cursor-pointer"
                onClick={() => setIsPlayingVideo(true)}
              >
                <img
                  src={getFileUrl(post.thumbnail.url)}
                  alt={post.thumbnail.description ?? post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity group-hover:bg-black/40">
                  <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayIcon className="h-10 w-10 text-white fill-white ml-2" />
                  </div>
                </div>
              </figure>
            );
          }

          if (videoUrl && (isPlayingVideo || !hasThumbnail)) {
            const ytMatch = videoUrl.match(
              /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
            );
            if (ytMatch) {
              const videoId = ytMatch[1];
              return (
                <figure className="mb-12 rounded-xl overflow-hidden aspect-video bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </figure>
              );
            }
            return (
              <figure className="mb-12 rounded-xl overflow-hidden aspect-video flex items-center justify-center bg-black">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </figure>
            );
          }

          if (post.thumbnail) {
            return (
              <figure className="mb-12 rounded-xl overflow-hidden aspect-video bg-muted">
                <img
                  src={getFileUrl(post.thumbnail.url)}
                  alt={post.thumbnail.description ?? post.title}
                  className="w-full h-full object-cover"
                />
              </figure>
            );
          }

          return null;
        })()}

        {/* TipTap outputs raw HTML so we need to inject it */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-navy-deep prose-a:text-gold hover:prose-a:text-navy prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
