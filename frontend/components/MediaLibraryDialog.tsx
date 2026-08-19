"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SearchIcon, ImageIcon, CircleCheckIcon, UploadIcon, Loader2Icon } from "lucide-react";
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
  
  // New States for Upload/Edit/Replace
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const selectedResource = resources.find(r => r.id === selectedId);

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

  // Update edit form when selection changes
  useEffect(() => {
    if (selectedResource) {
      setEditName(selectedResource.name || "");
      setEditDesc(selectedResource.description || "");
    }
  }, [selectedResource]);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        await axios.post("/resources/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      
      // Refresh list after upload
      setResources([]);
      setPage(1);
      setHasMore(true);
      fetchResources(1, debouncedSearch, true);
    } catch (err) {
      console.error("Failed to upload files:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    setReplacing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await axios.put(`/resources/${selectedId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        setResources(prev => prev.map(r => r.id === selectedId ? res.data.data : r));
      }
    } catch (err) {
      console.error("Failed to replace file:", err);
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedId) return;
    setSavingDetails(true);
    try {
      const res = await axios.put(`/resources/${selectedId}`, {
        name: editName,
        description: editDesc
      });
      if (res.data?.success) {
        setResources(prev => prev.map(r => r.id === selectedId ? res.data.data : r));
      }
    } catch (err) {
      console.error("Failed to save details:", err);
    } finally {
      setSavingDetails(false);
    }
  };

  const handleConfirm = () => {
    if (selectedResource) {
      onSelect(selectedResource.url, selectedResource.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl w-full flex flex-col h-[85vh] p-0 gap-0 overflow-hidden bg-white">
        
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-navy-deep m-0">
            Choose from Media Library
          </DialogTitle>
          <div className="flex gap-2 items-center mr-6">
            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <UploadIcon className="mr-2 h-4 w-4" />}
              Upload Images
            </Button>
          </div>
        </DialogHeader>

        {/* Hidden inputs */}
        <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
        <input type="file" ref={replaceInputRef} className="hidden" accept="image/*" onChange={handleReplace} />

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Side - Images Grid */}
          <div className={cn("flex-1 flex flex-col p-5 min-w-0 transition-all", selectedId ? "border-r border-border md:w-2/3" : "w-full")}>
            {/* Search Input */}
            <div className="relative mb-4">
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
                    onClick={() => setSelectedId(res.id)}
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
          </div>

          {/* Right Side - Details Panel */}
          {selectedId && selectedResource && (
            <div className="w-1/3 bg-muted/10 p-5 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
              <h3 className="font-medium text-navy-deep text-sm mb-1 border-b border-border pb-2">Image Details</h3>
              <div className="bg-muted/30 rounded-lg aspect-square overflow-hidden border border-border flex items-center justify-center relative group">
                <img src={getFileUrl(selectedResource.url)} alt={selectedResource.name} className="max-h-full max-w-full object-contain" />
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <Input 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea 
                    value={editDesc} 
                    onChange={e => setEditDesc(e.target.value)} 
                    rows={4}
                    className="text-sm resize-none"
                    placeholder="Add a description..."
                  />
                </div>
                <Button size="sm" onClick={handleSaveDetails} disabled={savingDetails} className="w-full">
                  {savingDetails ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : "Save Details"}
                </Button>
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground mb-3 text-center">Need to update this image everywhere?</p>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => replaceInputRef.current?.click()} disabled={replacing}>
                  {replacing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : "Replace File"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-white flex justify-end gap-2 shrink-0">
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
