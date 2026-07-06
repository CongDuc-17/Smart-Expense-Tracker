import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalyticsStore } from "../stores/analytics.store";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export function AnalyticsFilters() {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } =
    useAnalyticsStore();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select
        value={selectedMonth.toString()}
        onValueChange={(val) => setSelectedMonth(Number(val))}
      >
        <SelectTrigger className="w-[140px] bg-card border-border focus:ring-1 focus:ring-ring">
          <SelectValue placeholder="Chọn tháng" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={m.toString()}>
              Tháng {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear.toString()}
        onValueChange={(val) => setSelectedYear(Number(val))}
      >
        <SelectTrigger className="w-[120px] bg-card border-border focus:ring-1 focus:ring-ring">
          <SelectValue placeholder="Chọn năm" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              Năm {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
