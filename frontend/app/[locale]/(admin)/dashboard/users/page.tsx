"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  UsersIcon,
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  Loader2Icon,
  RotateCcwIcon,
  UserCheckIcon,
  UserXIcon,
  SendIcon,
  KeyIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import UserForm from "./UserForm";
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
import { Input } from "@/components/ui/input";

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "active" | "disabled" | "invited";
  deleted_at: string | null;
  role: Role | null;
  role_id: string | null;
}

export default function UsersPage() {
  const { axios } = useAxios();
  const t = useTranslations("UsersPage");

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [roleIdFilter, setRoleIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form Modal States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  // Soft-Delete / Restore Dialog States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

  const fetchRoles = async () => {
    try {
      const { data } = await axios.get("/roles");
      if (data.success) {
        setRoles(data.data);
      }
    } catch (err: any) {
      console.error("[Users Page] Failed to fetch roles:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleIdFilter) params.append("role_id", roleIdFilter);
      if (statusFilter) params.append("status", statusFilter);

      const { data } = await axios.get(`/users?${params.toString()}`);
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.message || "Failed to load users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleIdFilter, statusFilter]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedUser(undefined);
    setShowForm(true);
  };

  const handleOpenEdit = (user: User) => {
    setIsEditing(true);
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const endpoint =
        user.status === "active"
          ? `/users/disable/${user.id}`
          : `/users/enable/${user.id}`;
      const { data } = await axios.post(endpoint);
      if (data.success) {
        toast.add({
          title: "Success",
          description:
            user.status === "active"
              ? "User disabled successfully"
              : "User enabled successfully",
          type: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Action failed",
        type: "error",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { data } = await axios.delete(`/users/${id}`);
      if (data.success) {
        toast.add({
          title: "Deleted",
          description: "User soft-deleted successfully",
          type: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Delete failed",
        type: "error",
      });
    }
  };

  const handleRestoreUser = async (id: string) => {
    try {
      const { data } = await axios.post(`/users/restore/${id}`);
      if (data.success) {
        toast.add({
          title: "Restored",
          description: "User restored successfully",
          type: "success",
        });
        fetchUsers();
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Restore failed",
        type: "error",
      });
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      const { data } = await axios.post(`/users/resend-invite/${id}`);
      if (data.success) {
        toast.add({
          title: "Success",
          description: "Invitation email resent successfully",
          type: "success",
        });
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message ||
          err.message ||
          "Failed to resend invitation",
        type: "error",
      });
    }
  };

  const handleSendResetLink = async (id: string) => {
    try {
      const { data } = await axios.post(`/users/reset-password/${id}`);
      if (data.success) {
        toast.add({
          title: "Success",
          description: "Password reset link sent successfully",
          type: "success",
        });
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message ||
          err.message ||
          "Failed to send reset link",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground flex items-center gap-2">
            <UsersIcon className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto"
          permission="users.create"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> {t("inviteBtn")}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md">
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl"
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <select
            value={roleIdFilter}
            onChange={(e) => setRoleIdFilter(e.target.value)}
            className="flex h-10 w-full md:w-45 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">{t("allRoles")}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full md:w-45 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="active">{t("active")}</option>
            <option value="disabled">{t("disabled")}</option>
            <option value="invited">{t("invited")}</option>
            <option value="deleted">{t("deleted")}</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {t("loading")}
            </span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-bold">{t("noUsersFound")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("noUsersFoundDesc")}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 px-6 font-semibold">
                  {t("colName")}
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold">
                  {t("colEmail")}
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold">
                  {t("colRole")}
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold">
                  {t("colStatus")}
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-right">
                  {t("colActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {users.map((user) => {
                const isSoftDeleted = user.deleted_at !== null;
                const status = isSoftDeleted ? "deleted" : user.status;

                return (
                  <TableRow
                    key={user.id}
                    className={isSoftDeleted ? "opacity-60 bg-muted/5" : ""}
                  >
                    <TableCell className="py-4 px-6 font-semibold text-foreground">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-foreground">
                      {user.role?.name || "—"}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none border ${
                          status === "active"
                            ? "bg-green-500/10 border-green-500/30 text-green-600"
                            : status === "disabled"
                              ? "bg-red-500/10 border-red-500/30 text-red-600"
                              : status === "invited"
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-600"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                        }`}
                      >
                        {t(status)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {!isSoftDeleted ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(user)}
                              permission="users.update"
                            >
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                            {user.status === "invited" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600"
                                onClick={() => handleResendInvite(user.id)}
                                permission="users.create"
                                title="Resend Invite"
                              >
                                <SendIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {user.status !== "invited" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-500 hover:text-amber-600"
                                onClick={() => handleSendResetLink(user.id)}
                                permission="users.update"
                                title="Send Password Reset Link"
                              >
                                <KeyIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {user.status !== "invited" && user.role?.name.toLowerCase() !== "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  user.status === "active"
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-green-500 hover:text-green-600"
                                }`}
                                onClick={() => handleToggleStatus(user)}
                                permission="users.update"
                                title={
                                  user.status === "active"
                                    ? "Disable User"
                                    : "Enable User"
                                }
                              >
                                {user.status === "active" ? (
                                  <UserXIcon className="h-4 w-4" />
                                ) : (
                                  <UserCheckIcon className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {user.role?.name.toLowerCase() !== "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                onClick={() => {
                                  setDeleteId(user.id);
                                  setConfirmDeleteOpen(true);
                                }}
                                permission="users.delete"
                                title="Delete User"
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary/80"
                            onClick={() => {
                              setRestoreId(user.id);
                              setConfirmRestoreOpen(true);
                            }}
                            permission="users.update"
                            title="Restore User"
                          >
                            <RotateCcwIcon className="h-4 w-4" />
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

      {/* Invite/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif">
              {isEditing ? t("editUser") : t("inviteModalTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <UserForm
              initialData={
                selectedUser
                  ? {
                      id: selectedUser.id,
                      first_name: selectedUser.first_name,
                      last_name: selectedUser.last_name,
                      email: selectedUser.email,
                      role_id: selectedUser.role_id || "",
                    }
                  : undefined
              }
              onSuccess={() => {
                setShowForm(false);
                fetchUsers();
              }}
              onCancel={() => setShowForm(false)}
              isEditing={isEditing}
              rolesList={roles}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (deleteId) {
                  await handleDeleteUser(deleteId);
                  setDeleteId(null);
                  setConfirmDeleteOpen(false);
                }
              }}
            >
              {t("confirmDeleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Alert */}
      <AlertDialog
        open={confirmRestoreOpen}
        onOpenChange={setConfirmRestoreOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmRestoreTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmRestoreDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (restoreId) {
                  await handleRestoreUser(restoreId);
                  setRestoreId(null);
                  setConfirmRestoreOpen(false);
                }
              }}
            >
              {t("confirmRestoreBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
