/**
 * Service for fetching HYPE/USD price data from CoinGecko
 */
export class PriceFeedService {
  private constructor() {}

  public static async getHypeUsdRate(): Promise<bigint> {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=hyperliquid&vs_currencies=usd");

      if (!response.ok) {
        throw new Error("Failed to fetch price from CoinGecko");
      }

      const data = await response.json();
      const price = data.hyperliquid.usd;

      // Convert price to same decimal format as Chainlink (8 decimals)
      const priceInChainlinkFormat = BigInt(Math.round(price * 1e8));
      return priceInChainlinkFormat;
    } catch (error) {
      console.error("Error fetching HYPE/USD price:", error);
      throw error;
    }
  }
}
