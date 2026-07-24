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
        resource: 'users',
        submenu: [{
            label: 'List',
            href: '/dashboard/users',
            resource: 'users',
        }, {
            label: 'Roles',
            href: '/dashboard/roles',
            resource: 'users',
        }]
    },
    {
        label: 'Settings',
        icon: SettingsIcon,
        href: '/dashboard/settings',
        resource: 'settings'
    },
]

export const useNavLink = (user?: UserWithRole | null): { menus: Menu[] } => {
    let menus: Menu[] = []

    if (user)
        menus = adminMenu.filter(menu => can(menu.resource, user.role))

    return { menus }
}