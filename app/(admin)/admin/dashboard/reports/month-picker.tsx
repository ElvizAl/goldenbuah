"use client";

interface MonthOption {
  label: string;
  year: number;
  month: number;
}

interface MonthPickerProps {
  options: MonthOption[];
  selectedYear: number;
  selectedMonth: number;
  basePath: string;
}

export function MonthPicker({
  options,
  selectedYear,
  selectedMonth,
  basePath,
}: MonthPickerProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [y, m] = e.target.value.split("-");
    window.location.href = `${basePath}?year=${y}&month=${m}`;
  }

  return (
    <select
      defaultValue={`${selectedYear}-${selectedMonth}`}
      onChange={handleChange}
      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
    >
      {options.map((opt) => (
        <option
          key={`${opt.year}-${opt.month}`}
          value={`${opt.year}-${opt.month}`}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}
