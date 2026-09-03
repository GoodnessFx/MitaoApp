export class CostCalculator {
  /**
   * Calculates the Mitao retail price and margins based on wholesale cost
   * Rules from prompt:
   * - Mitao margin is typically 35-40% on top of landed cost
   * - Landed cost = (wholesale cost + estimated shipping + buffer)
   */
  static calculatePricing(wholesalePriceCny: number, exchangeRateUsdCny: number = 7.1) {
    const wholesalePriceUsd = wholesalePriceCny / exchangeRateUsdCny;
    
    // Simplistic estimation for now: $5 base shipping + 10% buffer
    const estimatedShippingUsd = 5.00;
    const bufferMultiplier = 1.10;
    
    const landedCostUsd = (wholesalePriceUsd + estimatedShippingUsd) * bufferMultiplier;
    
    // Mitao Margin (38% markup)
    const marginMultiplier = 1.38;
    const retailPriceUsd = landedCostUsd * marginMultiplier;
    
    // Fictional "Original Price" for the UI strike-through (e.g. 20% higher than retail)
    const originalPriceUsd = retailPriceUsd * 1.20;

    return {
      wholesalePriceUsd: Number(wholesalePriceUsd.toFixed(2)),
      landedCostUsd: Number(landedCostUsd.toFixed(2)),
      retailPriceUsd: Number(retailPriceUsd.toFixed(2)),
      originalPriceUsd: Number(originalPriceUsd.toFixed(2)),
      mitaoProfitUsd: Number((retailPriceUsd - landedCostUsd).toFixed(2)),
    };
  }
}
