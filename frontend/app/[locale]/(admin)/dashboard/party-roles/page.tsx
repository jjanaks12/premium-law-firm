"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PartyRolesPage() {
  const { axios } = useAxios();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nepaliName, setNepaliName] = useState("");

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/cases/meta/party-roles");
      setRoles(res.data.data);
    } catch (e) {
      toast.add({ title: "Error fetching party roles", type: "destructive" });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setName("");
    setNepaliName("");
    setOpen(true);
  };

  const handleOpenEdit = (role: any) => {
    setEditId(role.id);
    setName(role.name);
    setNepaliName(role.nepaliName || "");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`/cases/meta/party-roles/${editId}`, {
          name,
          nepaliName,
        });
        toast.add({ title: "Role updated" });
      } else {
        await axios.post("/cases/meta/party-roles", { name, nepaliName });
        toast.add({ title: "Role added" });
      }
      setOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.add({
        title: "Error",
        description: error.response?.data?.message || "Unknown error",
        type: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await axios.delete(`/cases/meta/party-roles/${id}`);
      toast.add({ title: "Role deleted" });
      fetchRoles();
    } catch (error: any) {
      toast.add({ title: "Error deleting role", type: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Party Roles</h1>
        <Button onClick={handleOpenAdd}>
          <PlusIcon className="w-4 h-4 mr-2" /> Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name (English)</TableHead>
                <TableHead>Name (Nepali)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.nepaliName || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(role)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Party Role" : "Add Party Role"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Name (English) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Name (Nepali)</Label>
              <Input
                value={nepaliName}
                onChange={(e) => setNepaliName(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
