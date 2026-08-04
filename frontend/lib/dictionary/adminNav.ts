import { User, Role } from "@prisma/client";
import { BellIcon, BookOpenIcon, FolderCogIcon, FolderOpenIcon, FingerprintIcon, LayoutDashboardIcon, ListTreeIcon, SettingsIcon, UserCogIcon, UserKeyIcon, UsersIcon, BriefcaseIcon } from "lucide-react";
import { can } from "@/lib/services/authorization.service";
import { useTranslations } from "next-intl";

export type UserWithRole = User & {
    role?: Role | null;
    avatar?: any;
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
        label: 'dashboard',
        icon: LayoutDashboardIcon,
        href: '/dashboard',
        resource: 'dashboard'
    },
    {
        label: 'users',
        icon: UsersIcon,
        href: '/dashboard/users',
        resource: '*',
        submenu: [{
            label: 'list',
            href: '/dashboard/users',
            resource: 'users',
            icon: ListTreeIcon,
        }, {
            label: 'roles',
            href: '/dashboard/roles',
            resource: 'roles',
            icon: UserKeyIcon,
        }]
    },
    {
        label: 'resources',
        icon: FolderOpenIcon,
        href: '/dashboard/resources',
        resource: 'resources'
    },
    {
        label: 'pages',
        icon: BookOpenIcon,
        href: '/dashboard/pages',
        resource: '*',
        submenu: [{
            label: 'allPages',
            href: '/dashboard/pages',
            resource: 'pages',
            icon: ListTreeIcon,
        }, {
            label: 'pageTypes',
            href: '/dashboard/pages/types',
            resource: 'pages',
            icon: FolderCogIcon,
        }]
    },
    {
        label: 'cases',
        icon: BriefcaseIcon,
        href: '/dashboard/cases',
        resource: 'cases',
        submenu: [{
            label: 'allCases',
            href: '/dashboard/cases',
            resource: 'cases',
            icon: ListTreeIcon,
        }, {
            label: 'caseNatures',
            href: '/dashboard/case-natures',
            resource: 'case-natures',
            icon: FolderCogIcon,
        }, {
            label: 'partyRoles',
            href: '/dashboard/party-roles',
            resource: 'party-roles',
            icon: UsersIcon,
        }, {
            label: 'courtLevels',
            href: '/dashboard/court-levels',
            resource: 'court-levels',
            icon: BookOpenIcon,
        }]
    },
    {
        label: 'settings',
        icon: SettingsIcon,
        href: '/dashboard/settings',
        resource: '*',
        submenu: [{
            label: 'profile',
            href: '/dashboard/settings/profile',
            resource: '*',
            icon: UserCogIcon,
        }, {
            label: 'notification',
            href: '/dashboard/settings/notification',
            resource: '*',
            icon: BellIcon,
        }, {
            label: 'changePassword',
            href: '/dashboard/settings/change-password',
            resource: '*',
            icon: FingerprintIcon,
        }]
    },
]

export const useNavLink = (user?: UserWithRole | null): { menus: Menu[] } => {
    const t = useTranslations("AdminNav");
    let menus: Menu[] = []

    if (user) {
        const filterMenus = (menuList: Menu[]): Menu[] => {
            return menuList
                .map(menu => {
                    const hasAccess = menu.resource === '*' || can(menu.resource, user.role)
                    if (!hasAccess) return null

                    const translatedMenu = { ...menu, label: t(menu.label as any) }

                    if (menu.submenu) {
                        const filteredSubmenu = filterMenus(menu.submenu)
                        if (filteredSubmenu.length === 0) {
                            return null
                        }
                        return { ...translatedMenu, submenu: filteredSubmenu }
                    }

                    return translatedMenu
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