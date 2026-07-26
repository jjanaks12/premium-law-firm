"use client";

import { useEffect, useState, useRef } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  UploadCloudIcon,
  SearchIcon,
  FileIcon,
  FileTextIcon,
  Trash2Icon,
  DownloadIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react";

interface Resource {
  id: string;
  url: string;
  type: string;
  name: string | null;
  size: number | null;
  created_at: string;
}

export default function ResourcesPage() {
  const { axios } = useAxios();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/resources");
      if (data.success) {
        setResources(data.data);
      }
    } catch (error: any) {
      if (error.isNetworkError || error.code === "ERR_NETWORK" || error.message === "Network Error") {
        console.warn("[Resources Page] Failed to fetch resources: Network Error (Backend offline)");
      } else {
        console.error("Failed to fetch resources:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Reset page to 1 when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/resources/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percent);
          }
        },
      });

      if (response.data.success) {
        toast.add({
          title: "Upload Successful",
          description: `Successfully uploaded ${file.name}`,
          type: "success",
        });
        fetchResources();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload file";
      toast.add({
        title: "Upload Failed",
        description: message,
        type: "error",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id: string, filename: string | null) => {
    if (
      !confirm(`Are you sure you want to delete ${filename || "this file"}?`)
    ) {
      return;
    }
    try {
      const response = await axios.delete(`/resources/${id}`);
      if (response.data.success) {
        toast.add({
          title: "Resource Deleted",
          description: "The file was successfully removed.",
          type: "success",
        });
        fetchResources();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete resource";
      toast.add({
        title: "Delete Failed",
        description: message,
        type: "error",
      });
    }
  };

  const getFileUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const host = apiUrl.replace("/api/v1", "");
    return `${host}${url}`;
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string, url: string) => {
    if (type.startsWith("image/")) {
      return (
        <div className="size-10 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getFileUrl(url)}
            alt="Preview"
            className="size-full object-cover"
          />
        </div>
      );
    }
    if (type === "application/pdf") {
      return (
        <div className="size-10 rounded-lg border border-red-200 bg-red-50 text-red-500 flex items-center justify-center">
          <FileTextIcon className="size-5" />
        </div>
      );
    }
    if (
      type.includes("word") ||
      type.includes("officedocument.wordprocessingml")
    ) {
      return (
        <div className="size-10 rounded-lg border border-blue-200 bg-blue-50 text-blue-500 flex items-center justify-center">
          <FileIcon className="size-5" />
        </div>
      );
    }
    return (
      <div className="size-10 rounded-lg border border-border bg-muted text-muted-foreground flex items-center justify-center">
        <FileIcon className="size-5" />
      </div>
    );
  };

  const filtered = resources.filter((r) => {
    const term = search.toLowerCase();
    const nameMatch = r.name ? r.name.toLowerCase().includes(term) : false;
    const typeMatch = r.type.toLowerCase().includes(term);
    return nameMatch || typeMatch;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedResources = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-serif text-foreground">
            Resources
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload, store, and manage law firm files (images, PDFs, documents).
          </p>
        </div>
        <Button
          onClick={fetchResources}
          variant="outline"
          size="sm"
          className="w-fit self-start sm:self-center"
        >
          <RefreshCwIcon className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border hover:border-primary/55 bg-card"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2Icon className="animate-spin size-10 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Uploading file...
            </p>
            <div className="w-48 bg-muted rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {uploadProgress}%
            </span>
          </div>
        ) : (
          <>
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloudIcon className="size-6" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Drag and drop your file here, or{" "}
                <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports Images, PDFs, and MS Office documents up to 20MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Resources Table List */}
      <div className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-6">
        <div className="w-full sm:max-w-xs">
          <InputGroup className="rounded-lg border-input bg-background/50 h-10">
            <InputGroupInput
              type="text"
              placeholder="Search files by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
            <InputGroupAddon align="inline-end">
              <SearchIcon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2Icon className="animate-spin size-8 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">
              Loading resources...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <FileIcon className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">
              No resources found
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your first document above to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[8%]">Preview</TableHead>
                    <TableHead className="w-[45%]">Name</TableHead>
                    <TableHead className="w-[15%]">Size</TableHead>
                    <TableHead className="w-[15%]">Type</TableHead>
                    <TableHead className="w-[17%] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResources.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{getFileIcon(r.type, r.url)}</TableCell>
                      <TableCell className="font-medium text-foreground truncate max-w-70">
                        {r.name || "Unnamed File"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatSize(r.size)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-30">
                        {r.type}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              window.open(getFileUrl(r.url), "_blank")
                            }
                            className="size-8"
                          >
                            <DownloadIcon className="size-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r.id, r.name)}
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Showing{" "}
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{" "}
                  to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </span>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 && setCurrentPage(currentPage - 1)
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages &&
                          setCurrentPage(currentPage + 1)
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
