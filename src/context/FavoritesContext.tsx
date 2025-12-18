import React, { createContext, useContext, useState, useCallback } from 'react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: number;
  marketCap?: string;
  volume?: string;
  icon?: string;
}

interface FavoritesContextType {
  favorites: Token[];
  addFavorite: (token: Token) => void;
  removeFavorite: (tokenId: string) => void;
  isFavorite: (tokenId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Token[]>([]);

  const addFavorite = useCallback((token: Token) => {
    setFavorites(prev => {
      if (prev.some(t => t.id === token.id)) return prev;
      return [...prev, token];
    });
  }, []);

  const removeFavorite = useCallback((tokenId: string) => {
    setFavorites(prev => prev.filter(token => token.id !== tokenId));
  }, []);

  const isFavorite = useCallback((tokenId: string) => {
    return favorites.some(token => token.id === tokenId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
