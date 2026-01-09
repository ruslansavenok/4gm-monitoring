"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import type { GameItem } from "../../../db/models/GameItem";

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

// TODO: remove byId logic or make 2 hooks, or something else, but make it better
export function useGameItems() {
  const { gameItems, gameItemsById } = useContext(GameItemsContext);

  const getGameItemById = useCallback(
    (id: number) => gameItemsById[id],
    [gameItemsById],
  );

  return { gameItems, getGameItemById };
}
