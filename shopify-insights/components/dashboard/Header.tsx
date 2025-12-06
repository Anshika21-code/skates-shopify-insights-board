import DateRangePicker from "@/components/ui/DateRangePicker";

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="small-muted">Last 30 days</p>
      </div>
      <div className="flex items-center gap-4">
        <DateRangePicker />
      </div>
    </header>
  );
}
