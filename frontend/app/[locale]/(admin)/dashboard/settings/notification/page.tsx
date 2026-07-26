"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  SearchIcon,
  MailIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  EyeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Notification {
  id: string;
  type: string;
  recipient: string;
  subject: string | null;
  content: string;
  status: "SENT" | "FAILED";
  error: string | null;
  created_at: string;
}

export default function NotificationPage() {
  const { axios } = useAxios();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/notifications");
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error: any) {
      if (error.isNetworkError || error.code === "ERR_NETWORK" || error.message === "Network Error") {
        console.warn("[Notifications Page] Failed to fetch notifications: Network Error (Backend offline)");
      } else {
        console.error("Failed to fetch notifications:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Reset to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = notifications.filter(
    (n) =>
      n.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (n.subject && n.subject.toLowerCase().includes(search.toLowerCase())),
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedNotifications = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold font-serif text-foreground">
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm">
            View history of all email notifications sent to your account.
          </p>
        </div>
        <Button
          onClick={fetchNotifications}
          variant="outline"
          size="sm"
          className="w-fit self-start sm:self-center"
        >
          <RefreshCwIcon className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-6">
        <div className="w-full sm:max-w-xs">
          <InputGroup className="rounded-lg border-input bg-background/50 h-10">
            <InputGroupInput
              type="text"
              placeholder="Search subject or recipient..."
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
              Loading notifications...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <MailIcon className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">
              No notifications found
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              You don't have any notifications logged in the database yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Recipient</TableHead>
                    <TableHead className="w-[40%]">Subject</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[15%]">Time</TableHead>
                    <TableHead className="w-[10%] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium text-foreground truncate max-w-50">
                        {n.recipient}
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-62.5">
                        {n.subject || (
                          <span className="italic text-muted-foreground/60">
                            No Subject
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {n.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2Icon className="size-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                            <AlertCircleIcon className="size-3" />
                            Failed
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedNotification(n)}
                          className="size-8"
                        >
                          <EyeIcon className="size-4 text-muted-foreground hover:text-foreground" />
                        </Button>
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
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-serif">
                  Notification Details
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Sent on{" "}
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </p>
              </DialogHeader>

              <div className="space-y-4 text-sm mt-4">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
                  <span className="font-semibold text-muted-foreground">
                    Recipient:
                  </span>
                  <span className="col-span-2 text-foreground font-medium">
                    {selectedNotification.recipient}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
                  <span className="font-semibold text-muted-foreground">
                    Subject:
                  </span>
                  <span className="col-span-2 text-foreground font-medium">
                    {selectedNotification.subject || "No Subject"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
                  <span className="font-semibold text-muted-foreground">
                    Status:
                  </span>
                  <span className="col-span-2">
                    {selectedNotification.status === "SENT" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2Icon className="size-3" />
                        Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                        <AlertCircleIcon className="size-3" />
                        Failed
                      </span>
                    )}
                  </span>
                </div>

                {selectedNotification.error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg font-mono">
                    <strong>Error details:</strong> {selectedNotification.error}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="font-semibold text-muted-foreground block">
                    Email Content Preview:
                  </span>
                  <div
                    className="p-4 border border-border rounded-lg bg-muted/40 max-h-[30vh] overflow-y-auto overflow-x-hidden wrap-break-word text-xs text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: selectedNotification.content,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={() => setSelectedNotification(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
