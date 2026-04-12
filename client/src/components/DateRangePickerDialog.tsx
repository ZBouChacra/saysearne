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
  title = "Select Dates",
}: DateRangePickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    return disabledDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const handleStartDateClick = () => {
    setSelectingEnd(false);
    setOpen(true);
  };

  const handleEndDateClick = () => {
    if (!startDate) {
      alert("Please select start date first");
      return;
    }
    setSelectingEnd(true);
    setOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!selectingEnd) {
      onStartChange(date);
    } else {
      if (date < startDate!) {
        alert("End date must be after start date");
        return;
      }
      onEndChange(date);
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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium">Start Date</label>
          <Dialog open={open && !selectingEnd} onOpenChange={(isOpen) => {
            if (isOpen) {
              setSelectingEnd(false);
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-lg h-11 mt-1"
                onClick={handleStartDateClick}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(startDate)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg">Select Start Date</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                defaultMonth={startDate}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium">End Date</label>
          <Dialog open={open && selectingEnd} onOpenChange={(isOpen) => {
            if (isOpen && startDate) {
              setSelectingEnd(true);
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal rounded-lg h-11 mt-1"
                onClick={handleEndDateClick}
                disabled={!startDate}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(endDate)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg">Select End Date</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  if (isDateDisabled(date)) return true;
                  if (startDate && date < startDate) return true;
                  return false;
                }}
                defaultMonth={endDate || startDate}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

      {startDate && endDate && (
        <Button
          variant="outline"
          onClick={() => {
            onStartChange(undefined);
            onEndChange(undefined);
          }}
          className="w-full"
        >
          Clear Dates
        </Button>
      )}
    </div>
  );
}
