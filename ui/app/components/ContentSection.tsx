"use client";

import { useState, useMemo } from "react";
import { PriceChart } from "./PriceChart";
import { Filters, FilterValues, DEFAULT_FILTERS } from "./Filters";
import { ItemIcon } from "./ItemIcon";
import { useItems } from "../context/ItemsContext";
import { deleteMonitoringTask } from "../actions/monitoring-tasks";

interface Listing {
  _id: string;
  seenAt: string;
  characterName: string;
  price: number;
  enchant: number;
}

interface ContentSectionProps {
  selectedItemId: number;
  listings: Listing[];
}

function applyFilters(listings: Listing[], filters: FilterValues): Listing[] {
  return listings.filter((listing) => {
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

function formatDate(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContentSection({
  selectedItemId,
  listings,
}: ContentSectionProps) {
  const { getItemById } = useItems();
  const selectedItem = getItemById(selectedItemId);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const filteredListings = useMemo(
    () => applyFilters(listings, filters),
    [listings, filters],
  );

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ItemIcon item={selectedItem} className="w-10 h-10" />
            <h2 className="text-xl font-semibold text-slate-100">
              {selectedItem.name}
            </h2>
          </div>
          <form action={() => deleteMonitoringTask(selectedItemId)}>
            <button
              type="submit"
              className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
              title="Delete monitoring task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 3.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
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
