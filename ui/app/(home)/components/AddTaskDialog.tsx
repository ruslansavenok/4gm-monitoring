"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { GameItem } from "@db/models/GameItem";
import { createMonitoringTask } from "@/ui/actions/monitoring-tasks";
import { GameItemAutocomplete } from "@/ui/components/GameItemAutocomplete";
import { useGameItems } from "@/ui/context/GameItemsContext";

// TODO: refactor
export function AddTaskDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { gameItems } = useGameItems();
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [checkFrequency, setCheckFrequency] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItem(null);
      setCheckFrequency(300);
      setError(null);
    }
  }, [isOpen]);

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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">
            Add Monitoring Task
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <GameItemAutocomplete
            gameItems={gameItems}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
          />

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

          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

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
