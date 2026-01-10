"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type { GameItem } from "../../../db/models/GameItem";
import { ItemIcon } from "./ItemIcon";

type GameItemAutocompleteProps = {
  gameItems: GameItem[];
  selectedItem: GameItem | null;
  onSelectItem: (item: GameItem | null) => void;
};

// TODO: move to the root
export function GameItemAutocomplete({
  gameItems,
  selectedItem,
  onSelectItem,
}: GameItemAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || selectedItem) return [];

    const numericQuery = parseInt(searchQuery, 10);
    const queryWords = searchQuery.toLowerCase().split(/\s+/);

    return gameItems
      .filter((item) => {
        const nameLower = item.name.toLowerCase();
        const nameMatch = queryWords.every((word) => nameLower.includes(word));
        const idMatch = !isNaN(numericQuery) && item._id === numericQuery;
        return nameMatch || idMatch;
      })
      .slice(0, 20);
  }, [searchQuery, selectedItem, gameItems]);

  useEffect(() => {
    setSearchQuery(selectedItem ? selectedItem.name : "");
    setShowSuggestions(false);
  }, [selectedItem]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Item
      </label>
      {selectedItem ? (
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md">
          <ItemIcon item={selectedItem} />
          <span className="flex-1 text-sm text-slate-200">
            {selectedItem.name}
          </span>
          <button
            type="button"
            onClick={() => onSelectItem(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => filteredItems.length > 0 && setShowSuggestions(true)}
            placeholder="Search by name or ID..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
          {showSuggestions && filteredItems.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredItems.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-700 transition-colors"
                  >
                    <ItemIcon item={item} />
                    <span className="text-sm text-slate-200">{item.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      #{item._id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
