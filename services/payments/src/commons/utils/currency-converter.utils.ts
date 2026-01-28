import { Converter } from 'easy-currencies';
import { rateObject } from 'easy-currencies/dist/converter';

export class CurrencyConverter {
  private static rates: Record<
    string,
    { rates: rateObject; fetchedAt: number }
  > = {};
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static converter = new Converter();

  private static async fetchRatesForCurrency(
    currency: string,
  ): Promise<rateObject> {
    const now = Date.now();
    const cached = this.rates[currency];

    if (cached && now - cached.fetchedAt < this.CACHE_DURATION) {
      return cached.rates;
    }

    console.log(`Fetching rates for currency: ${currency}`);
    const rates = await this.converter.getRates(currency, '', true);
    console.log(`Fetched rates for ${currency}`);

    this.rates[currency] = {
      rates,
      fetchedAt: now,
    };

    return rates;
  }

  static async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) return amount;

    const fromRates = await this.fetchRatesForCurrency(from);
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
