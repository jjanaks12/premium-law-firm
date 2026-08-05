"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAxios } from "@/lib/services/axios.service";
import { toast } from "@/components/ui/toast";
import { Loader2Icon, ArrowRightLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface CaseMigrationModalProps {
  parentId: string;
  onSuccess: () => void;
}

export function CaseMigrationModal({
  parentId,
  onSuccess,
}: CaseMigrationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("common");
  const { axios } = useAxios();

  const [formData, setFormData] = useState({
    room_no: "",
    judge_name: "",
    court_level: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post("/cases/migration", {
        parent_id: parentId,
        ...formData,
      });
      toast.add({
        title: "Success",
        description: "Case migrated successfully",
        type: "success",
      });
      setIsOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err.response?.data?.message ||
          err.message ||
          "Failed to migrate case",
        type: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-2" />}
      >
        <ArrowRightLeftIcon className="w-4 h-4" />
        Migrate Case
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Migrate Case</DialogTitle>
          <DialogDescription>
            Migrate this case to a new court room, judge, or court level.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="court_level">Court Level</Label>
            <Input
              id="court_level"
              name="court_level"
              value={formData.court_level}
              onChange={handleChange}
              placeholder="e.g. Supreme Court"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room_no">Section / Room No</Label>
            <Input
              id="room_no"
              name="room_no"
              value={formData.room_no}
              onChange={handleChange}
              placeholder="e.g. Room 204"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="judge_name">Judge Name</Label>
            <Input
              id="judge_name"
              name="judge_name"
              value={formData.judge_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
