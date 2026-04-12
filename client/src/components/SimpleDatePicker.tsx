import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";

interface SimpleDatePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartChange: (date: Date | undefined) => void;
  onEndChange: (date: Date | undefined) => void;
  minDate?: Date;
  title?: string;
}

export function SimpleDatePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minDate,
  title = "Select Dates",
}: SimpleDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!tempStart) {
      setTempStart(date);
    } else if (!tempEnd) {
      if (date < tempStart) {
        setTempStart(date);
        setTempEnd(tempStart);
      } else {
        setTempEnd(date);
      }
    } else {
      setTempStart(date);
      setTempEnd(undefined);
    }
  };

  const handleConfirm = () => {
    if (tempStart && tempEnd) {
      onStartChange(tempStart);
      onEndChange(tempEnd);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setTempStart(undefined);
    setTempEnd(undefined);
    onStartChange(undefined);
    onEndChange(undefined);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const days = tempStart && tempEnd ? Math.max(0, Math.ceil((tempEnd.getTime() - tempStart.getTime()) / 86400000) + 1) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal rounded-lg h-11">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? `${formatDate(startDate)} → ${formatDate(endDate)}` : "Select date range"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={tempEnd || tempStart}
            onSelect={(date) => date && handleDateClick(date)}
            disabled={isDateDisabled}
            defaultMonth={tempStart || new Date()}
            required
          />
          <div className="space-y-2">
            {tempStart && (
              <p className="text-sm"><strong>Start:</strong> {formatDate(tempStart)}</p>
            )}
            {tempEnd && (
              <p className="text-sm"><strong>End:</strong> {formatDate(tempEnd)} ({days} days)</p>
            )}
          </div>
          <div className="flex gap-2">
            {(tempStart || tempEnd) && (
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Clear
              </Button>
            )}
            <Button onClick={handleConfirm} disabled={!tempStart || !tempEnd} className="flex-1 bg-primary hover:bg-primary/90">
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
