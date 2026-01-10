"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import type { GameItem } from "../../db/models/GameItem";

interface GameItemsContextType {
  gameItems: GameItem[];
  gameItemsById: Record<number, GameItem>;
}

const GameItemsContext = createContext<GameItemsContextType>(null!);

export function GameItemsProvider({
  children,
  gameItems,
}: {
  children: ReactNode;
  gameItems: GameItem[];
}) {
  const value = useMemo(() => {
    const gameItemsById: Record<number, GameItem> = {};
    for (const gameItem of gameItems) {
      gameItemsById[gameItem._id] = gameItem;
    }
    return { gameItems, gameItemsById };
  }, [gameItems]);

  return (
    <GameItemsContext.Provider value={value}>
      {children}
    </GameItemsContext.Provider>
  );
}

export function useGameItems() {
  return useContext(GameItemsContext);
}
