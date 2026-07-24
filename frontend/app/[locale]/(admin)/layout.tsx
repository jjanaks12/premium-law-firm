"use client";

import React, { useEffect } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "@/src/i18n/routing";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show loading indicator during authentication check
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-muted/40">
        <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            {user.first_name} {user.last_name}
          </span>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
