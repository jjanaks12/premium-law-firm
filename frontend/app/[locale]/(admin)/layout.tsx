"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-muted/40">
        <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            Admin User
          </span>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
