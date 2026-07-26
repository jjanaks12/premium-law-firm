"use client";
import { useState } from "react";

import Brand from "@/components/Brand";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { useNavLink } from "@/lib/dictionary/adminNav";
import { Link, usePathname, useRouter } from "@/src/i18n/routing";
import { ChevronRightIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User } from "@/components/User";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { menus } = useNavLink(user);
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  const { open: isSidebarOpened } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background relative"
    >
      <SidebarHeader className="h-14 border-b border-border flex items-center justify-center px-4 shrink-0">
        <Brand theme="dark" compact={!isSidebarOpened} />
      </SidebarHeader>
      <span className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
        <SidebarTrigger className="rounded-full" variant="outline" />
      </span>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menus.map((menu) => {
                const Icon = menu.icon;
                const isPathActive = menu.submenu
                  ? menu.submenu.some((sub) => pathname === sub.href)
                  : pathname === menu.href;
                const isOpen = openState[menu.href] ?? isPathActive;

                if (!menu.submenu || menu.submenu?.length == 0)
                  return (
                    <SidebarMenuItem key={menu.href}>
                      <SidebarMenuButton
                        size={isSidebarOpened ? "lg" : "icon-2xl"}
                        render={<Link href={menu.href} />}
                        isActive={pathname === menu.href}
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "shrink-0",
                              !isSidebarOpened ? "size-6!" : "size-4",
                            )}
                          />
                        )}
                        {isSidebarOpened && <span>{menu.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                return (
                  <Collapsible
                    render={<SidebarMenuItem />}
                    key={menu.href}
                    open={isOpen}
                    onOpenChange={(open) =>
                      setOpenState((prev) => ({
                        ...prev,
                        [menu.href]: open,
                      }))
                    }
                    className="group/collapsible"
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          size={isSidebarOpened ? "lg" : "icon-2xl"}
                          isActive={menu.submenu.some(
                            (sub) => pathname === sub.href,
                          )}
                        />
                      }
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "shrink-0",
                            !isSidebarOpened ? "size-6!" : "size-4",
                          )}
                        />
                      )}
                      {isSidebarOpened && <span>{menu.label}</span>}
                      {isSidebarOpened && (
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {menu.submenu &&
                          menu.submenu.map((submenu) => {
                            const SubIcon = submenu.icon;

                            return (
                              <SidebarMenuItem key={submenu.href}>
                                <SidebarMenuButton
                                  size={isSidebarOpened ? "lg" : "icon-2xl"}
                                  isActive={pathname === submenu.href}
                                  render={
                                    <Link href={submenu.href}>
                                      {SubIcon && (
                                        <SubIcon
                                          className={cn(
                                            "shrink-0",
                                            !isSidebarOpened
                                              ? "size-6!"
                                              : "size-4",
                                          )}
                                        />
                                      )}
                                      {isSidebarOpened && submenu.label}
                                    </Link>
                                  }
                                />
                              </SidebarMenuItem>
                            );
                          })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        {user && <User user={user} />}
        <Button
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          variant="outline"
          size={!isSidebarOpened ? "icon" : "default"}
          className={!isSidebarOpened ? "rounded-full" : ""}
        >
          <LogOutIcon className="size-4 shrink-0" />
          {isSidebarOpened && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
