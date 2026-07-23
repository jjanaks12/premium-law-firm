// Canonical resource → allowed-actions catalog.
// Every authorize(resource, action) call and role seed must stay within this set.
// The admin UI reads GET /api/roles/permissions/catalog to display this.
export const PERMISSION_CATALOG: Record<string, string[]> = {
  auth:      ["read"],
  dashboard: ["read"],
  role:      ["read", "list", "create", "update", "delete"],
  document:  ["read", "list", "create", "delete"],
  mail:      ["send"],
};
