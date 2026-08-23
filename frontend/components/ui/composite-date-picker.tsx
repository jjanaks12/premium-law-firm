"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function YearCombobox({
  value,
  onChange,
  minYear = 2000,
  maxYear = 2100,
}: any) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    (maxYear - i).toString(),
  );

  const filtered = years.filter((y) => y.includes(search));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 font-normal h-12"
          />
        }
      >
        {value || "Year"}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-30 p-0">
        <div className="flex flex-col">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 border-b rounded-none focus-visible:ring-0 h-9"
          />
          <div className="max-h-50 overflow-y-auto p-1">
            {filtered.map((y) => (
              <div
                key={y}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === y
                    ? "bg-accent text-accent-foreground font-medium"
                    : "",
                )}
                onClick={() => {
                  onChange(y);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {value === y && <Check className="absolute left-2 h-4 w-4" />}
                {y}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                No results
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface CompositeDatePickerProps {
  value?: string | Date | null;
  onChange?: (date: string) => void;
  showTime?: boolean;
  minYear?: number;
  maxYear?: number;
  id?: string;
  className?: string;
}

export function CompositeDatePicker({
  value,
  onChange,
  showTime = false,
  minYear = 2000,
  maxYear = 2100,
  id,
  className,
}: CompositeDatePickerProps) {
  const t = useTranslations("CompositeDatePicker");
  const tMonths = useTranslations("Months");

  let y = "",
    m = "",
    d = "",
    h = "00",
    min = "00";

  if (value) {
    const vStr =
      typeof value === "string" ? value : (value as Date).toISOString();
    const match = vStr.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/,
    );
    if (match) {
      y = match[1];
      m = match[2];
      d = match[3];
      if (match[4]) h = match[4];
      if (match[5]) min = match[5];
    }
  }

  const [localY, setLocalY] = React.useState(y);
  const [localM, setLocalM] = React.useState(m);
  const [localD, setLocalD] = React.useState(d);
  const [localH, setLocalH] = React.useState(h);
  const [localMin, setLocalMin] = React.useState(min);

  React.useEffect(() => {
    if (y) setLocalY(y);
    if (m) setLocalM(m);
    if (d) setLocalD(d);
    if (h) setLocalH(h);
    if (min) setLocalMin(min);
  }, [y, m, d, h, min]);

  const triggerChange = (
    ny: string,
    nm: string,
    nd: string,
    nh: string,
    nmin: string,
  ) => {
    if (ny && nm && nd) {
      if (showTime) {
        onChange?.(
          `${ny}-${nm.padStart(2, "0")}-${nd.padStart(2, "0")} ${nh.padStart(2, "0")}:${nmin.padStart(2, "0")}:00`,
        );
      } else {
        onChange?.(`${ny}-${nm.padStart(2, "0")}-${nd.padStart(2, "0")}`);
      }
    } else {
      onChange?.("");
    }
  };

  const days = Array.from({ length: 32 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );

  return (
    <div
      className={cn("flex flex-wrap gap-2 items-center w-full", className)}
      id={id}
    >
      <div className="flex items-center text-sm font-medium text-muted-foreground mr-1 h-10 px-3 rounded-md bg-muted/50 border border-input">
        BS
      </div>
      <div className="w-27.5">
        <YearCombobox
          value={localY}
          onChange={(ny: string) => {
            setLocalY(ny);
            triggerChange(ny, localM, localD, localH, localMin);
          }}
          minYear={minYear}
          maxYear={maxYear}
        />
      </div>
      <div className="w-30">
        <Select
          value={localM}
          onValueChange={(nm) => {
            setLocalM(nm || "");
            triggerChange(localY, nm || "", localD, localH, localMin);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("month")} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) =>
              (i + 1).toString().padStart(2, "0"),
            ).map((mv, i) => (
              <SelectItem key={mv} value={mv}>
                {tMonths((i + 1).toString())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-21.25">
        <Select
          value={localD}
          onValueChange={(nd) => {
            setLocalD(nd || "");
            triggerChange(localY, localM, nd || "", localH, localMin);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("day")} />
          </SelectTrigger>
          <SelectContent>
            {days.map((dv) => (
              <SelectItem key={dv} value={dv}>
                {dv}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showTime && (
        <div className="flex gap-2 items-center ml-auto">
          <Input
            type="number"
            min={0}
            max={23}
            value={localH}
            onChange={(e) => {
              setLocalH(e.target.value);
              triggerChange(localY, localM, localD, e.target.value, localMin);
            }}
            className="w-17.5 h-10"
            placeholder={t("hour")}
          />
          <span className="font-bold text-muted-foreground">:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={localMin}
            onChange={(e) => {
              setLocalMin(e.target.value);
              triggerChange(localY, localM, localD, localH, e.target.value);
            }}
            className="w-17.5 h-10"
            placeholder={t("minute")}
          />
        </div>
      )}
    </div>
  );
}
