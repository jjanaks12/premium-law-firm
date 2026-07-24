import { User, Role } from "@prisma/client";
import { LayoutDashboardIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { can } from "@/lib/services/authorization.service";

export type UserWithRole = User & {
    role?: Role | null;
};

interface Menu {
    label: string
    icon?: React.ElementType | null
    href: string
    resource: string
    role?: string
    submenu?: Menu[]
}

const adminMenu: Menu[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboardIcon,
        href: '/dashboard',
        resource: 'dashboard'
    },
    {
        label: 'Users',
        icon: UsersIcon,
        href: '/dashboard/users',
        resource: '*',
        submenu: [{
            label: 'List',
            href: '/dashboard/users',
            resource: 'users',
        }, {
            label: 'Roles',
            href: '/dashboard/roles',
            resource: 'roles',
        }]
    },
    {
        label: 'Settings',
        icon: SettingsIcon,
        href: '/dashboard/settings',
        resource: '*',
        submenu: [{
            label: 'Profile',
            href: '/dashboard/settings/profile',
            resource: 'settings',
        }, {
            label: 'Notification',
            href: '/dashboard/settings/notification',
            resource: 'settings',
        }, {
            label: 'Change password',
            href: '/dashboard/settings/change-password',
            resource: 'settings',
        }]
    },
]

export const useNavLink = (user?: UserWithRole | null): { menus: Menu[] } => {
    let menus: Menu[] = []

    if (user) {
        const filterMenus = (menuList: Menu[]): Menu[] => {
            return menuList
                .map(menu => {
                    const hasAccess = menu.resource === '*' || can(menu.resource, user.role)
                    if (!hasAccess) return null

                    if (menu.submenu) {
                        const filteredSubmenu = filterMenus(menu.submenu)
                        if (filteredSubmenu.length === 0) {
                            return null
                        }
                        return { ...menu, submenu: filteredSubmenu }
                    }

                    return menu
                })
                .filter((menu): menu is Menu => menu !== null)
        }

        menus = filterMenus(adminMenu)
    }

    return { menus }
}

export const canAccessPathname = (pathname: string, user?: UserWithRole | null): boolean => {
    if (!user) return false

    // 1. Check if there's a specific submenu item matching pathname exactly
    for (const menu of adminMenu) {
        if (menu.submenu) {
            const sub = menu.submenu.find(s => s.href === pathname)
            if (sub) {
                return sub.resource === '*' || can(sub.resource, user.role)
            }
        }
    }

    // 2. Check if there's a top-level menu item matching pathname exactly
    const menu = adminMenu.find(m => m.href === pathname)
    if (menu) {
        if (menu.resource === '*') {
            // If it has submenus, they can access it only if they can access at least one submenu item
            if (menu.submenu) {
                return menu.submenu.some(sub => sub.resource === '*' || can(sub.resource, user.role))
            }
            return true
        }
        return can(menu.resource, user.role)
    }

    // 3. For any other paths not registered in adminMenu, allow access if authenticated
    return true
}