"use client";

import { useState } from "react";
import { AddTaskDialog } from "./AddTaskDialog";

type Item = {
  _id: number;
  name: string;
  icon: string;
};

type AddTaskButtonProps = {
  allItems: Item[];
};

export function AddTaskButton({ allItems }: AddTaskButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
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

      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        allItems={allItems}
      />
    </>
  );
}
