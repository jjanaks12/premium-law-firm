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
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { useNavLink } from "@/lib/dictionary/adminNav";
import { Link, usePathname } from "@/src/i18n/routing";
import { ChevronRightIcon } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { menus } = useNavLink(user);
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background"
    >
      <SidebarHeader className="h-14 border-b border-border flex items-center justify-center px-4 shrink-0">
        <Brand theme="dark" />
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menus.map((menu) => {
                const Icon = menu.icon;
                const isPathActive = pathname.startsWith(menu.href);
                const isOpen = openState[menu.href] ?? isPathActive;

                if (!menu.submenu || menu.submenu?.length == 0)
                  return (
                    <SidebarMenuItem key={menu.href}>
                      <SidebarMenuButton render={<Link href={menu.href} />}>
                        {Icon && <Icon className="size-4 shrink-0" />}
                        <span>{menu.label}</span>
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
                    <CollapsibleTrigger render={<SidebarMenuButton />}>
                      {Icon && <Icon />}
                      <span>{menu.label}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {menu.submenu &&
                          menu.submenu.map((submenu) => (
                            <SidebarMenuItem key={submenu.href}>
                              <SidebarMenuButton
                                render={
                                  <Link href={submenu.href}>
                                    {submenu.label}
                                  </Link>
                                }
                              />
                            </SidebarMenuItem>
                          ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button>Logout</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
