import { Role } from "@prisma/generated";

export const can = (permission: string, role?: Role | null) => {
    if (!role) return false;

    // Normalize format: e.g. "role.delete" -> "roles:delete", "roles.delete" -> "roles:delete"
    let normalized = permission.replace(".", ":");
    if (normalized.startsWith("role:")) {
        normalized = normalized.replace("role:", "roles:");
    }

    // Check dynamic permissions JSON from database
    const permissions = (role.permissions as Record<string, boolean>) || {};
    
    // If it's a general resource check (e.g. "users"), check if the user has access to ANY action of this resource
    if (!normalized.includes(":")) {
        return Object.keys(permissions).some(
            (key) => key.startsWith(`${normalized}:`) && !!permissions[key]
        );
    }

    return !!permissions[normalized];
}