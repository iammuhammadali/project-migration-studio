import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { inputClass } from "./Field";

export function DateField({
  id,
  value,
  onChange,
  error,
  placeholder = "Pick a date",
  fromYear = 1920,
}: {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string | undefined;
  placeholder?: string | undefined;
  fromYear?: number | undefined;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;
  const today = new Date();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={!!error}
          className={cn(inputClass(error), "w-full justify-start px-3 font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="text-primary" />
          {date ? format(date, "dd MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl p-0" align="start">
        <Calendar
          mode="single"
          {...(date ? { selected: date, defaultMonth: date } : {})}
          captionLayout="dropdown"
          startMonth={new Date(fromYear, 0)}
          endMonth={today}
          disabled={{ after: today }}
          onSelect={(d) => {
            if (d) onChange(format(d, "yyyy-MM-dd"));
            setOpen(false);
          }}
          className="pointer-events-auto p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
