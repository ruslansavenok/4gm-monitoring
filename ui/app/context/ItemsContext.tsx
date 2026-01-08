"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import type { ItemType } from "../../../db/models/Item";

interface ItemsContextType {
  items: ItemType[];
  itemsById: Record<number, ItemType>;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({
  children,
  items,
}: {
  children: ReactNode;
  items: ItemType[];
}) {
  const itemsById = useMemo(() => {
    const index: Record<number, ItemType> = {};
    for (const item of items) {
      index[item._id] = item;
    }
    return index;
  }, [items]);

  return (
    <ItemsContext.Provider value={{ items, itemsById }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider");
  }

  const getItemById = (id: number) => {
    const item = context.itemsById[id];
    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }
    return item;
  };

  return {
    items: context.items,
    getItemById,
  };
}
