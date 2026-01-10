"use client";

import { PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { GameItemIcon } from "../../../components/GameItemIcon";
import { useGameItems } from "../../../context/GameItemsContext";
import { AddTaskDialog } from "./AddTaskDialog";

interface SidebarProps {
  monitoredItemIds: number[];
  selectedItemId: number | null;
}

export function Sidebar({ monitoredItemIds, selectedItemId }: SidebarProps) {
  const { gameItemsById } = useGameItems();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const items = monitoredItemIds.map((id) => gameItemsById[id]);

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
              const isActive = item._id === selectedItemId;
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
                    <GameItemIcon item={item} className="w-8 h-8" />
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
          <PlusIcon className="w-4 h-4" />
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
