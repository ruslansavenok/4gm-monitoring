"use client";

import Link from "next/link";
import { useState } from "react";
import { useGameItems } from "../../context/GameItemsContext";
import { AddTaskDialog } from "./AddTaskDialog";
import { ItemIcon } from "./ItemIcon";

interface SidebarProps {
  monitoredGameItemIds: number[];
  selectedGameItemId: number | null;
}

export function Sidebar({
  monitoredGameItemIds,
  selectedGameItemId,
}: SidebarProps) {
  const { getGameItemById } = useGameItems();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const items = monitoredGameItemIds.map((id) => getGameItemById(id));

  return (
    <aside className="w-1/4 min-w-[240px] max-w-[320px] border-r border-slate-800 bg-slate-900 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Monitored Items
        </h1>
      </div>
      <nav className="p-2 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 p-3">No items being monitored</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = item._id === selectedGameItemId;
              return (
                <li key={item._id}>
                  <Link
                    href={`?itemId=${item._id}`}
                    title={item.name}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-500/15 text-blue-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <ItemIcon item={item} className="w-8 h-8" />
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-slate-100 border border-slate-700 rounded-md transition-colors"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add
        </button>
      </div>

      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </aside>
  );
}
