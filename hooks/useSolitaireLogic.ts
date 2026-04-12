import { useState, useCallback } from 'react';

export const useSolitaireLogic = () => {
  const [gameState, setGameState] = useState<{
    deck: string[];
    pool: string[][];
  }>({
    deck: [],
    pool: [[], [], [], [], []]
  });

  const initGame = useCallback((missingLetters: string[]) => {
    // Fisher-Yates shuffle to randomize the missing letters
    const shuffled = [...missingLetters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const initialPool: string[][] = [[], [], [], [], []];
    const newDeck = [...shuffled];

    // Draw the first 5 cards, one for each stack in the pool
    for (let i = 0; i < 5; i++) {
      if (newDeck.length > 0) {
        // Pop from the end of the deck and push to the stack
        initialPool[i].push(newDeck.pop()!);
      }
    }

    setGameState({
      deck: newDeck,
      pool: initialPool
    });
  }, []);

  const drawCards = useCallback(() => {
    setGameState(prev => {
      if (prev.deck.length === 0) return prev;

      const newDeck = [...prev.deck];
      const newPool = prev.pool.map(stack => [...stack]);
        for (let i = 0; i < 5; i++) {
          if (newDeck.length > 0) {
            newPool[i].push(newDeck.pop()!);
          }
        }
      return {
        deck: newDeck,
        pool: newPool
      };
    });
  }, []);

  const playCard = useCallback((poolIndex: number) => {
    setGameState(prev => {
      if (poolIndex < 0 || poolIndex >= prev.pool.length) return prev;
      
      const stack = prev.pool[poolIndex];
      if (stack.length === 0) return prev;

      const newPool = [...prev.pool];
      // Create a new array for the modified stack
      newPool[poolIndex] = stack.slice(0, -1);

      return {
        ...prev,
        pool: newPool
      };
    });
  }, []);

  const resetDeck = useCallback((missingLetters: string[]) => {
    setGameState(prev => {
      // Fisher-Yates shuffle
      const shuffled = [...missingLetters];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const initialPool: string[][] = [[], [], [], [], []];
      const newDeck = [...shuffled];

      // Draw initial cards
      for (let i = 0; i < 5; i++) {
        if (newDeck.length > 0) {
          initialPool[i].push(newDeck.pop()!);
        }
      }

      return {
        deck: newDeck,
        pool: initialPool
      };
    });
  }, []);

  return {
    deck: gameState.deck,
    pool: gameState.pool,
    initGame,
    drawCards,
    playCard,
    resetDeck  };
};