"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

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

export default function NotificationLog() {
  const { axios } = useAxios();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Test Email Modal / Form State
  const [testEmail, setTestEmail] = useState({ to: "", subject: "", body: "" });
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await axios.get("/notifications");
    if (data.success) {
      setNotifications(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.to || !testEmail.subject || !testEmail.body) return;

    try {
      setSendingTest(true);
      setTestResult(null);
      const { data } = await axios.post("/notifications/send-test", testEmail);
      setTestResult({
        success: data.success,
        message:
          data.message ||
          (data.success ? "Email sent successfully!" : "Failed to send email."),
      });
      if (data.success) {
        setTestEmail({ to: "", subject: "", body: "" });
        // Refresh logs after a short delay to let the worker process it
        setTimeout(fetchNotifications, 2000);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err || "Failed to send test email.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const filtered = notifications.filter(
    (n) =>
      n.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (n.subject && n.subject.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Send Test Notification */}
        <div className="lg:col-span-1 p-6 bg-card rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-foreground mb-1">
              Send Test Email
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Trigger a test email to process through the background queue.
            </p>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Recipient Email
                </label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={testEmail.to}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, to: e.target.value })
                  }
                  required
                  className="rounded-lg h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subject
                </label>
                <Input
                  type="text"
                  placeholder="Test Email Subject"
                  value={testEmail.subject}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, subject: e.target.value })
                  }
                  required
                  className="rounded-lg h-10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Body Content
                </label>
                <textarea
                  placeholder="Hello, this is a test email content..."
                  value={testEmail.body}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, body: e.target.value })
                  }
                  required
                  className="w-full min-h-24 p-3 rounded-lg border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    testResult.success
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={sendingTest}
                className="w-full rounded-lg h-10 font-semibold"
              >
                {sendingTest && (
                  <Loader2Icon className="animate-spin mr-2 size-4" />
                )}
                Send Test Email
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Notification Logs */}
        <div className="lg:col-span-2 p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">
                Notification Logs
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time status of all emails processed in the database.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <InputGroup className="rounded-lg border-input bg-background/50 h-10">
                <InputGroupInput
                  type="text"
                  placeholder="Search recipient or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs"
                />
                <InputGroupAddon align="inline-end">
                  <SearchIcon className="size-4 text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2Icon className="animate-spin size-8 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                Loading log entries...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <MailIcon className="size-12 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                No notifications found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Send a test email to populate the log entries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium text-xs">
                    <th className="pb-3 pr-4">Recipient</th>
                    <th className="pb-3 px-4">Subject</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((n) => (
                    <tr
                      key={n.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-medium text-foreground">
                        {n.recipient}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                        {n.subject || (
                          <span className="italic text-muted-foreground/60">
                            No Subject
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {n.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2Icon className="size-3" />
                            Sent
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 cursor-help"
                            title={n.error || "Unknown error"}
                          >
                            <AlertCircleIcon className="size-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pl-4 text-right text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
