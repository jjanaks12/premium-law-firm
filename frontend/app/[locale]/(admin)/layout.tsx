"use client";

import React, { useEffect } from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { usePathname, useRouter } from "@/src/i18n/routing";
import { canAccessPathname } from "@/lib/dictionary/adminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  // Check page-level authorization
  if (!canAccessPathname(pathname, user)) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col min-h-screen bg-muted/40">
          <main className="flex-1 p-6 flex flex-col items-center justify-center bg-background text-center">
            <div className="max-w-md p-8 bg-card border border-border rounded-xl shadow-lg space-y-6">
              <div className="mx-auto size-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-serif text-foreground">
                Access Denied
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You do not have the required permissions to view this page.
                Please contact your system administrator if you believe this is
                an error.
              </p>
              <button
                onClick={() => router.replace("/dashboard")}
                className="w-full py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-colors text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-muted/40">
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
