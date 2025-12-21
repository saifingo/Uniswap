import { COINGECKO_API, TOKEN_IDS } from '../config/env';

export interface TokenPrice {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

export interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export class PriceService {
  private static cache: Map<string, { data: TokenPrice; timestamp: number }> = new Map();
  private static CACHE_DURATION = 60000; // 1 minute

  /**
   * Fetch multiple token prices from CoinGecko
   */
  static async fetchTokenPrices(tokenIds?: string[]): Promise<CoinGeckoToken[]> {
    try {
      const ids = tokenIds?.join(',') || Object.values(TOKEN_IDS).join(',');
      
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from CoinGecko:', error);
      return [];
    }
  }

  /**
   * Fetch single token price
   */
  static async fetchTokenPrice(tokenId: string): Promise<TokenPrice> {
    try {
      // Check cache
      const cached = this.cache.get(tokenId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      const priceData: TokenPrice = {
        id: tokenId,
        symbol: tokenId.toUpperCase(),
        price: data[tokenId]?.usd || 0,
        change24h: data[tokenId]?.usd_24h_change || 0,
      };

      // Update cache
      this.cache.set(tokenId, {
        data: priceData,
        timestamp: Date.now(),
      });

      return priceData;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return {
        id: tokenId,
        symbol: tokenId.toUpperCase(),
        price: 0,
        change24h: 0,
      };
    }
  }

  /**
   * Get price for a specific token symbol
   */
  static async getPriceBySymbol(symbol: string): Promise<number> {
    try {
      const tokenId = TOKEN_IDS[symbol as keyof typeof TOKEN_IDS];
      if (!tokenId) {
        console.warn(`Token ID not found for symbol: ${symbol}`);
        return 0;
      }

      const priceData = await this.fetchTokenPrice(tokenId);
      return priceData.price;
    } catch (error) {
      console.error('Error getting price by symbol:', error);
      return 0;
    }
  }

  /**
   * Fetch prices for multiple symbols
   */
  static async getPricesBySymbols(symbols: string[]): Promise<Record<string, number>> {
    try {
      const tokenIds = symbols
        .map((symbol) => TOKEN_IDS[symbol as keyof typeof TOKEN_IDS])
        .filter(Boolean);

      if (tokenIds.length === 0) {
        return {};
      }

      const tokens = await this.fetchTokenPrices(tokenIds);
      
      const prices: Record<string, number> = {};
      tokens.forEach((token) => {
        const symbol = Object.keys(TOKEN_IDS).find(
          (key) => TOKEN_IDS[key as keyof typeof TOKEN_IDS] === token.id
        );
        if (symbol) {
          prices[symbol] = token.current_price;
        }
      });

      return prices;
    } catch (error) {
      console.error('Error fetching prices by symbols:', error);
      return {};
    }
  }

  /**
   * Clear price cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}
