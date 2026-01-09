"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import type { GameItemType } from "../../../db/models/GameItem";

interface GameItemsContextType {
  gameItems: GameItemType[];
  gameItemsById: Record<number, GameItemType>;
}

const GameItemsContext = createContext<GameItemsContextType>(null!);

export function GameItemsProvider({
  children,
  gameItems,
}: {
  children: ReactNode;
  gameItems: GameItemType[];
}) {
  const value = useMemo(() => {
    const gameItemsById: Record<number, GameItemType> = {};
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
  const { gameItems, gameItemsById } = useContext(GameItemsContext);

  const getGameItemById = useCallback(
    (id: number) => gameItemsById[id],
    [gameItemsById],
  );

  return { gameItems, getGameItemById };
}
