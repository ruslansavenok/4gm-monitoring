"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { formatDate } from "lib/utils";
import { useState, useMemo } from "react";
import type { PrivateListing } from "@db/models/PrivateListing";
import { deleteMonitoringTask } from "@/actions/monitoring-tasks";
import { GameItemIcon } from "@/components/GameItemIcon";
import { useGameItems } from "@/context/GameItemsContext";
import { Filters, FilterValues, DEFAULT_FILTERS } from "./Filters";
import { PriceChart } from "./PriceChart";

type TimeRange = "14d" | "30d" | "3m" | "all";

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

// TODO: Review this shit
function applyFilters(
  listings: PrivateListing[],
  filters: FilterValues,
  timeRange: TimeRange,
): PrivateListing[] {
  const threshold = getDateThreshold(timeRange);

  return listings.filter((listing) => {
    // Date filter
    if (threshold && new Date(listing.seenAt) < threshold) {
      return false;
    }

    // Enchant filter
    if (filters.enchant.min !== null && listing.enchant < filters.enchant.min) {
      return false;
    }
    if (filters.enchant.max !== null && listing.enchant > filters.enchant.max) {
      return false;
    }

    return true;
  });
}

interface ContentSectionProps {
  selectedItemId: number;
  listings: PrivateListing[];
}

export function ContentSection({
  selectedItemId,
  listings,
}: ContentSectionProps) {
  const { gameItemsById } = useGameItems();
  const selectedItem = gameItemsById[selectedItemId];
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filteredListings = useMemo(
    () => applyFilters(listings, filters, timeRange),
    [listings, filters, timeRange],
  );

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GameItemIcon item={selectedItem} className="w-10 h-10" />
            <h2 className="text-xl font-semibold text-slate-100">
              {selectedItem.name}
            </h2>
          </div>
          {/* type button here */}
          <form action={() => deleteMonitoringTask(selectedItemId)}>
            <button
              type="submit"
              className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
              title="Delete monitoring task"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {filteredListings.length} listing
          {filteredListings.length !== 1 ? "s" : ""}{" "}
          {filteredListings.length !== listings.length && (
            <span className="text-slate-600">
              (filtered from {listings.length})
            </span>
          )}
        </p>
      </header>

      <Filters values={filters} onChange={setFilters} />

      <div className="flex gap-1 mb-4">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
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

      <PriceChart listings={filteredListings} />

      {filteredListings.length === 0 ? (
        <div className="text-slate-500 text-sm">
          No listings match the current filters.
        </div>
      ) : (
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
                  Seen At
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
                  Character
                </th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
                  Price
                </th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-4 py-3">
                  Enchant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredListings.map((listing) => (
                <tr
                  key={listing._id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-slate-300 tabular-nums">
                    {formatDate(listing.seenAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {listing.characterName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-100 tabular-nums text-right">
                    {listing.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-400 tabular-nums text-right">
                    {listing.enchant > 0 ? `+${listing.enchant}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
