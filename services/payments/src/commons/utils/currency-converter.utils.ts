import { Converter } from 'easy-currencies';
import { rateObject } from 'easy-currencies/dist/converter';
import codes from 'currency-codes';

export class CurrencyConverter {
  private static rates: Record<string, rateObject> = {};
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static converter = new Converter();

  private static async fetchRates(): Promise<void> {
    const now = Date.now();
    if (
      Object.keys(this.rates).length > 0 &&
      now - this.lastFetch < this.CACHE_DURATION
    ) {
      return;
    }

    const allCodes = codes.codes();

    const ratesPromises = allCodes.map(async (code) => {
      const rates = await this.converter.getRates(code, '', true);
      return { code, rates };
    });

    const ratesResults = await Promise.all(ratesPromises);
    ratesResults.forEach(({ code, rates }) => {
      this.rates[code] = rates;
    });
    this.lastFetch = now;
  }

  /**
   * Converts an amount from one currency to another
   */
  static async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) return amount;

    await this.fetchRates();
    const fromRates = this.rates[from];
    if (!fromRates) {
      throw new Error(`No rates found for currency: ${from}`);
    }

    const conversion = await this.converter.convert(
      amount,
      from,
      to,
      fromRates,
    );

    console.log(`Converting ${amount} ${from} to ${to} = ${conversion}`);
    return conversion;
  }
}
