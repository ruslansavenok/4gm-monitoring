"use client";

import { useState } from "react";

type TimeRange = "14d" | "30d" | "3m" | "all";

const DEFAULT_TIME_RANGE: TimeRange = "30d";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "14d", label: "14 Days" },
  { value: "30d", label: "30 Days" },
  { value: "3m", label: "3 Months" },
  { value: "all", label: "All" },
];

function getDateThreshold(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "14d":
      return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
  }
}

export interface FilterValues {
  enchant: {
    min: number | null;
    max: number | null;
  };
  minDate: Date | null;
}

export const DEFAULT_FILTERS: FilterValues = {
  enchant: {
    min: null,
    max: null,
  },
  minDate: getDateThreshold(DEFAULT_TIME_RANGE),
};

interface FiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export function Filters({ values, onChange }: FiltersProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    onChange({ ...values, minDate: getDateThreshold(range) });
  };

  const handleEnchantMinChange = (value: string) => {
    const num = value === "" ? null : parseInt(value, 10);
    onChange({
      ...values,
      enchant: { ...values.enchant, min: isNaN(num as number) ? null : num },
    });
  };

  const handleEnchantMaxChange = (value: string) => {
    const num = value === "" ? null : parseInt(value, 10);
    onChange({
      ...values,
      enchant: { ...values.enchant, max: isNaN(num as number) ? null : num },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 border border-slate-800 rounded-lg bg-slate-900/50 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Enchant
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={values.enchant.min ?? ""}
            onChange={(e) => handleEnchantMinChange(e.target.value)}
            className="w-16 px-2 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
          <span className="text-slate-500 text-sm">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={values.enchant.max ?? ""}
            onChange={(e) => handleEnchantMaxChange(e.target.value)}
            className="w-16 px-2 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => handleTimeRangeChange(range.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              timeRange === range.value
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
