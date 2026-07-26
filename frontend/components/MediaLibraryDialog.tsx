"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, ImageIcon, CircleCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, id: string) => void;
  getFileUrl: (url: string) => string;
}

export default function MediaLibraryDialog({
  isOpen,
  onClose,
  onSelect,
  getFileUrl,
}: MediaLibraryDialogProps) {
  const { axios } = useAxios();
  const [resources, setResources] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset state and fetch from page 1 when search query changes
  useEffect(() => {
    if (!isOpen) return;
    setResources([]);
    setPage(1);
    setHasMore(true);
    setSelectedId(null);
    setSelectedUrl(null);
    fetchResources(1, debouncedSearch, true);
  }, [debouncedSearch, isOpen]);

  // Infinite scroll observer
  useEffect(() => {
    if (!isOpen || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchResources(nextPage, debouncedSearch, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [resources, loading, hasMore, debouncedSearch, isOpen]);

  const fetchResources = async (pageNumber: number, searchString: string, isReset: boolean) => {
    try {
      setLoading(true);
      const { data } = await axios.get("/resources", {
        params: {
          page: pageNumber,
          limit: 15,
          search: searchString || undefined,
          type: "image",
        },
      });

      if (data.success) {
        const newResources = data.data || [];
        setResources((prev) => (isReset ? newResources : [...prev, ...newResources]));
        if (data.meta) {
          setHasMore(pageNumber < data.meta.totalPages);
        } else {
          setHasMore(newResources.length === 15);
        }
      }
    } catch (err) {
      console.warn("[Media Library] Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedId && selectedUrl) {
      onSelect(selectedUrl, selectedId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl w-full flex flex-col max-h-[85vh] p-6 gap-4">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-semibold text-navy-deep">
            Choose from Media Library
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by name..."
            className="pl-9 h-10 rounded-lg text-xs"
          />
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 py-1 custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {resources.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => {
                  setSelectedId(res.id);
                  setSelectedUrl(res.url);
                }}
                className={cn(
                  "group relative aspect-square rounded-lg border overflow-hidden bg-muted/10 focus:outline-none transition-all duration-200 cursor-pointer",
                  selectedId === res.id
                    ? "border-gold ring-2 ring-gold/40 shadow-sm"
                    : "border-border/60 hover:border-border hover:shadow-xs"
                )}
                style={{
                  contentVisibility: "auto",
                  containIntrinsicSize: "auto 100px",
                }}
              >
                <img
                  src={getFileUrl(res.url)}
                  alt={res.name || "Media"}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {selectedId === res.id && (
                  <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                    <div className="bg-gold text-navy-deep p-1 rounded-full shadow-sm">
                      <CircleCheckIcon className="size-4" />
                    </div>
                  </div>
                )}
              </button>
            ))}

            {loading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted/40 animate-pulse border border-border/20"
                />
              ))}

            {!loading && resources.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <ImageIcon className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs">No images found in your media library.</p>
              </div>
            )}

            {/* Intersection observer trigger target */}
            <div ref={observerRef} className="h-4 col-span-full w-full" />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4 flex gap-2 justify-end">
          <DialogClose render={<Button variant="outline" size="sm" className="rounded-lg h-9 text-xs" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="sm"
            className="rounded-lg h-9 text-xs"
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            Select Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
