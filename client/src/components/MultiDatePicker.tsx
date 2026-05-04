import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, X } from "lucide-react";

interface MultiDatePickerProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
  disabledDates?: string[];
  minDate?: Date;
  label?: string;
}

export function MultiDatePicker({
  selectedDates,
  onChange,
  disabledDates = [],
  minDate,
  label = "Select Dates",
}: MultiDatePickerProps) {
  const [month, setMonth] = useState(new Date());

  const dateSet = new Set(selectedDates);
  const disabledSet = new Set(disabledDates);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = date.toISOString().split("T")[0];
    if (disabledSet.has(dateStr)) return;
    const newDates = new Set(dateSet);
    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.add(dateStr);
    }
    onChange(Array.from(newDates).sort());
  };

  const isDateDisabled = (date: Date) => {
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      if (d < min) return true;
    }
    const dateStr = date.toISOString().split("T")[0];
    return disabledSet.has(dateStr);
  };

  const selectedDateObjects = selectedDates.map(d => new Date(d + "T00:00:00"));

  const clearAll = () => onChange([]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#4A9B82]" />
          {label}
        </label>
        {selectedDates.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground h-7 px-2">
            Clear all
          </Button>
        )}
      </div>

      <div className="border border-border/60 rounded-xl p-3 bg-card">
        <Calendar
          mode="multiple"
          selected={selectedDateObjects}
          onSelect={(dates) => {
            if (!dates) { onChange([]); return; }
            const strs = dates.map(d => d.toISOString().split("T")[0]);
            onChange(strs.sort());
          }}
          disabled={isDateDisabled}
          month={month}
          onMonthChange={setMonth}
          className="mx-auto"
        />
      </div>

      {selectedDates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{selectedDates.length}</strong> date{selectedDates.length !== 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedDates.map(d => (
              <Badge key={d} variant="outline" className="rounded-lg text-xs gap-1 py-1 px-2 border-[#4A9B82]/30">
                {formatDate(d)}
                <button onClick={() => {
                  onChange(selectedDates.filter(x => x !== d));
                }} className="ml-0.5 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
