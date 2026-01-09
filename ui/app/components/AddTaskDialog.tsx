"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ItemType } from "../../../db/models/Item";
import { ItemIcon } from "./ItemIcon";
import { createMonitoringTask } from "../actions/monitoring-tasks";

type AddTaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  allItems: ItemType[];
};

export function AddTaskDialog({
  isOpen,
  onClose,
  allItems,
}: AddTaskDialogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [checkFrequency, setCheckFrequency] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items client-side with multi-word search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || selectedItem) return [];

    const numericQuery = parseInt(searchQuery, 10);
    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    return allItems
      .filter((item) => {
        const nameLower = item.name.toLowerCase();
        // All query words must appear in the name
        const nameMatch = queryWords.every((word) => nameLower.includes(word));
        const idMatch = !isNaN(numericQuery) && item._id === numericQuery;
        return nameMatch || idMatch;
      })
      .slice(0, 20);
  }, [searchQuery, selectedItem, allItems]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedItem(null);
      setCheckFrequency(300);
      setError(null);
      setShowSuggestions(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelectItem = (item: ItemType) => {
    setSelectedItem(item);
    setSearchQuery(item.name);
    setShowSuggestions(false);
  };

  const handleClearSelection = () => {
    setSelectedItem(null);
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      setError("Please select an item");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createMonitoringTask(selectedItem._id, checkFrequency);
      router.refresh();
      onClose();
    } catch (e: unknown) {
      setError(`Failed: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">
            Add Monitoring Task
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Autocomplete */}
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
                  onClick={handleClearSelection}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() =>
                    filteredItems.length > 0 && setShowSuggestions(true)
                  }
                  placeholder="Search by name or ID..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
                {showSuggestions && filteredItems.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredItems.map((item) => (
                      <li key={item._id}>
                        <button
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-700 transition-colors"
                        >
                          <ItemIcon item={item} />
                          <span className="text-sm text-slate-200">
                            {item.name}
                          </span>
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

          {/* Check Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Check Frequency (seconds)
            </label>
            <input
              type="number"
              value={checkFrequency}
              onChange={(e) =>
                setCheckFrequency(parseInt(e.target.value, 10) || 0)
              }
              min={60}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedItem}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
