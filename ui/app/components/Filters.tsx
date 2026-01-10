"use client";

export interface FilterValues {
  enchant: {
    min: number | null;
    max: number | null;
  };
}

// TODO: refactor
export const DEFAULT_FILTERS: FilterValues = {
  enchant: {
    min: null,
    max: null,
  },
};

interface FiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export function Filters({ values, onChange }: FiltersProps) {
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
    </div>
  );
}
