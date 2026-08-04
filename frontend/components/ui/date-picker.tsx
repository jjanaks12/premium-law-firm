"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  id?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  className,
  id,
  placeholder = "Select date",
}: DatePickerProps) {
  const dateValue = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full h-12 justify-start text-left font-normal",
              !dateValue && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateValue && !isNaN(dateValue.getTime()) ? (
          format(dateValue, "PPP")
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onChange}
          autoFocus
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date(new Date().getFullYear() + 50, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
