"use client";

import { useAxios } from "@/lib/services/axios.service";
import { useEffect, useState, useMemo } from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileTextIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LogsPage() {
  const t = useTranslations("LogsPage");
  const { axios } = useAxios();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/logs");
      setLogs(res.data.data);
    } catch (error: any) {
      toast.add({
        title: error?.response?.data?.error?.message || t("fetchError"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogDetail = async (path: string) => {
    try {
      setSelectedLog(path);
      setLevelFilter("ALL");
      setStatusFilter("ALL");
      setLogContent(t("loading"));
      const res = await axios.get(
        `/logs/detail?path=${encodeURIComponent(path)}`,
      );
      setLogContent(res.data.data.content);
    } catch (error: any) {
      setLogContent(t("loadContentError"));
      toast.add({
        title: error?.response?.data?.error?.message || t("fetchDetailError"),
        type: "error",
      });
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await axios.delete(`/logs?path=${encodeURIComponent(path)}`);
      toast.add({ title: t("deleteSuccess"), type: "success" });
      if (selectedLog === path) {
        setSelectedLog(null);
        setLogContent("");
      }
      fetchLogs();
    } catch (error: any) {
      toast.add({
        title: error?.response?.data?.error?.message || t("deleteError"),
        type: "error",
      });
    }
  };

  const parsedLogs = useMemo(() => {
    if (
      !logContent ||
      logContent === t("loading") ||
      logContent === t("loadContentError")
    )
      return [];
    const entries: any[] = [];
    const lines = logContent.split("\n");
    let currentEntry: any = null;

    for (const line of lines) {
      if (!line.trim()) continue;

      const match = line.match(
        /^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.*)/,
      );
      if (match) {
        if (currentEntry) entries.push(currentEntry);

        const messagePart = match[5];
        const statusMatch = messagePart.match(/^(\d{3})\b/);
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;

        currentEntry = {
          raw: line,
          timestamp: match[1],
          level: match[2],
          method: match[3],
          url: match[4],
          message: messagePart,
          statusCode,
          meta: "",
        };
      } else if (currentEntry) {
        currentEntry.meta += (currentEntry.meta ? "\n" : "") + line;
        currentEntry.raw += "\n" + line;
      }
    }

    if (currentEntry) entries.push(currentEntry);
    return entries;
  }, [logContent, t]);

  const uniqueStatusCodes = useMemo(() => {
    const codes = new Set<number>();
    parsedLogs.forEach((log) => {
      if (log.statusCode) codes.add(log.statusCode);
    });
    return Array.from(codes).sort();
  }, [parsedLogs]);

  const filteredLogs = useMemo(() => {
    return parsedLogs.filter((log) => {
      if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
      if (statusFilter !== "ALL" && log.statusCode?.toString() !== statusFilter)
        return false;
      return true;
    });
  }, [parsedLogs, levelFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <Card className="w-full md:w-1/3">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-150">
            {logs.length === 0 ? (
              <div className="text-muted-foreground text-center py-4">
                {t("noLogs")}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {logs.map((log) => (
                  <div
                    key={log.path}
                    className={`flex items-center justify-between p-3 rounded-lg border ${selectedLog === log.path ? "bg-primary/10 border-primary" : "hover:bg-accent cursor-pointer"}`}
                    onClick={() => fetchLogDetail(log.path)}
                  >
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {log.year} - {log.month}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.date}.txt
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(log.path);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="w-full md:w-2/3">
        <CardHeader>
          <CardTitle>
            {selectedLog
              ? t("logDetails", { log: selectedLog })
              : t("selectLog")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedLog ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <Select
                  value={levelFilter}
                  onValueChange={(val) => setLevelFilter(val as string)}
                >
                  <SelectTrigger className="w-37.5">
                    <SelectValue placeholder={t("filterByLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("allLevels")}</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="WARN">WARN</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val as string)}
                >
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder={t("filterByStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("allStatusCodes")}</SelectItem>
                    {uniqueStatusCodes.map((code) => (
                      <SelectItem key={code} value={code.toString()}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-150 flex flex-col gap-3">
                {parsedLogs.length === 0 ? (
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {logContent || t("fileEmpty")}
                  </pre>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    {t("noLogsMatch")}
                  </div>
                ) : (
                  filteredLogs.map((log, i) => (
                    <div
                      key={i}
                      className="border bg-background rounded-md p-3 shadow-sm text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs">
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <Badge
                          variant={
                            log.level === "ERROR"
                              ? "destructive"
                              : log.level === "WARN"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {log.level}
                        </Badge>
                        <span className="font-semibold text-primary">
                          {log.method}
                        </span>
                        <span className="text-muted-foreground break-all">
                          {log.url}
                        </span>
                      </div>
                      <div className="font-medium mb-1">
                        {log.statusCode && (
                          <span
                            className={`mr-2 px-1.5 py-0.5 rounded text-white text-xs ${
                              log.statusCode >= 500
                                ? "bg-red-500"
                                : log.statusCode >= 400
                                  ? "bg-orange-500"
                                  : log.statusCode >= 300
                                    ? "bg-blue-500"
                                    : "bg-emerald-500"
                            }`}
                          >
                            {log.statusCode}
                          </span>
                        )}
                        {log.message}
                      </div>
                      {log.meta && (
                        <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-x-auto whitespace-pre-wrap font-mono">
                          {log.meta}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-50 text-muted-foreground">
              {t("clickLog")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
