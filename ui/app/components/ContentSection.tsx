"use client";

import { useState, useMemo } from "react";
import { PriceChart } from "./PriceChart";
import { Filters, FilterValues, DEFAULT_FILTERS } from "./Filters";

interface Listing {
  _id: string;
  seenAt: string;
  characterName: string;
  price: number;
  enchant: number;
}

interface Item {
  _id: number;
  name: string;
  icon: string;
}

interface ContentSectionProps {
  selectedItem: Item;
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
  selectedItem,
  listings,
}: ContentSectionProps) {
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const filteredListings = useMemo(
    () => applyFilters(listings, filters),
    [listings, filters],
  );

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <img
            src={`${selectedItem.icon.replace("/upload/images/icon/", "https://lutk.ru/Icon/Texture/")}`}
            alt=""
            className="w-10 h-10 rounded"
          />
          <h2 className="text-xl font-semibold text-slate-100">
            {selectedItem.name}
          </h2>
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
