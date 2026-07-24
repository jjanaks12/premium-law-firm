"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  ShieldIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import RoleForm, { ResourcePermissionInfo } from "./RoleForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: any;
  created_at: string;
}

export default function RolesPage() {
  const { axios } = useAxios();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableResources, setAvailableResources] = useState<
    ResourcePermissionInfo[]
  >([]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {} as Record<string, boolean>,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/roles");
      if (data.success) {
        setRoles(data.data);
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.message || "Failed to load roles",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data } = await axios.get("/roles/permissions");
      if (data.success) {
        const RESOURCE_METADATA: Record<
          string,
          { label: string; desc: string }
        > = {
          dashboard: {
            label: "Dashboard",
            desc: "Allows accessing the main dashboard logs and stats",
          },
          users: {
            label: "Users Management",
            desc: "Allows managing admin users, staff, and roles",
          },
          roles: {
            label: "Roles & Permissions",
            desc: "Allows managing custom security roles and permission grids",
          },
          settings: {
            label: "Settings Access",
            desc: "Allows viewing and editing global system settings",
          },
        };

        const map = data.data as Record<string, string[]>;
        const list = Object.entries(map).map(([resource, actions]) => ({
          resource,
          label:
            RESOURCE_METADATA[resource]?.label ||
            `${resource.charAt(0).toUpperCase()}${resource.slice(1)}`,
          desc:
            RESOURCE_METADATA[resource]?.desc ||
            `Access policies for the ${resource} resource`,
          actions,
        }));

        setAvailableResources(list);
      }
    } catch (err: any) {
      console.error("[Roles Page] Failed to fetch permissions:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);

    // Initialize permissions for all resource:action combinations
    const initialPermissions: Record<string, boolean> = {};
    availableResources.forEach((res) => {
      res.actions.forEach((act) => {
        initialPermissions[`${res.resource}:${act}`] = false;
      });
    });

    setFormData({
      name: "",
      description: "",
      permissions: initialPermissions,
    });
    setShowForm(true);
  };

  const handleOpenEdit = (role: Role) => {
    setIsEditing(true);
    setEditingId(role.id);

    const rolePerms = (role.permissions as Record<string, boolean>) || {};
    const permissions: Record<string, boolean> = {};

    availableResources.forEach((res) => {
      res.actions.forEach((act) => {
        const key = `${res.resource}:${act}`;
        permissions[key] = !!rolePerms[key];
      });
    });

    setFormData({
      name: role.name,
      description: role.description || "",
      permissions,
    });
    setShowForm(true);
  };



  const handleDelete = async (id: string) => {
    try {
      const { data } = await axios.delete(`/roles/${id}`);
      if (data.success) {
        toast.add({
          title: "Deleted",
          description: "Role deleted successfully",
          type: "success",
        });
        fetchRoles();
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.message || "Failed to delete role",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-2">
            <ShieldIcon className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles and assign precise access abilities to resources.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto" permission="roles.create">
          <PlusIcon className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading roles...
            </span>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <ShieldIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Roles Found</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating a custom role.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 px-6 font-semibold">Role Name</TableHead>
                <TableHead className="py-4 px-6 font-semibold">Description</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {roles.map((role) => {
                return (
                  <TableRow key={role.id}>
                    <TableCell className="py-4 px-6 font-semibold text-foreground">
                      {role.name}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-muted-foreground max-w-xs truncate">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(role)}
                          permission="roles.update"
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        {role.name.toLowerCase() !== "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => {
                              setDeleteId(role.id);
                              setConfirmOpen(true);
                            }}
                            permission="roles.delete"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif">
              {isEditing ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <RoleForm
              formData={formData}
              onSuccess={() => {
                setShowForm(false);
                fetchRoles();
              }}
              onCancel={() => setShowForm(false)}
              isEditing={isEditing}
              editingId={editingId}
              resourcesList={availableResources}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will soft-delete the role from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (deleteId) {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                  setConfirmOpen(false);
                }
              }}
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
