import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";

interface DateRangePickerDialogProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartChange: (date: Date | undefined) => void;
  onEndChange: (date: Date | undefined) => void;
  minDate?: Date;
  disabledDates?: Date[];
  title?: string;
}

export function DateRangePickerDialog({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minDate,
  disabledDates = [],
  title = "Select Date Range",
}: DateRangePickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    return disabledDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!selectingEnd && !startDate) {
      onStartChange(date);
      setSelectingEnd(true);
    } else if (!selectingEnd && startDate) {
      if (date < startDate) {
        onStartChange(date);
        onEndChange(startDate);
      } else {
        onEndChange(date);
      }
      setSelectingEnd(false);
      setOpen(false);
    } else if (selectingEnd && startDate) {
      if (date < startDate) {
        onStartChange(date);
        onEndChange(startDate);
      } else {
        onEndChange(date);
      }
      setSelectingEnd(false);
      setOpen(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal rounded-lg h-11"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate
            ? `${formatDate(startDate)} → ${formatDate(endDate)}`
            : selectingEnd
              ? `From ${formatDate(startDate)}, select end date`
              : "Select date range"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            {selectingEnd ? "Select End Date" : "Select Start Date"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Calendar
            mode="single"
            selected={selectingEnd ? endDate : startDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            defaultMonth={selectingEnd ? endDate : startDate}
          />
          {startDate && endDate && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
              <p>
                <strong>Start:</strong> {formatDate(startDate)}
              </p>
              <p>
                <strong>End:</strong> {formatDate(endDate)}
              </p>
              <p className="text-muted-foreground mt-1">
                {Math.max(
                  0,
                  Math.ceil(
                    (endDate.getTime() - startDate.getTime()) / 86400000
                  ) + 1
                )}{" "}
                days
              </p>
            </div>
          )}
          <div className="flex gap-2">
            {startDate && endDate && (
              <Button
                variant="outline"
                onClick={() => {
                  onStartChange(undefined);
                  onEndChange(undefined);
                  setSelectingEnd(false);
                }}
                className="flex-1"
              >
                Clear
              </Button>
            )}
            <Button
              onClick={() => setOpen(false)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
