import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inputClass } from "./Field";

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={!!disabled}>
      <SelectTrigger id={id} className={inputClass(error)} aria-invalid={!!error}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <SelectItem key={opt.value} value={opt.value} className="py-2.5">
              {opt.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
