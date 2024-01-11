export interface ISteamSettings {
    profitPercent: number;
    remainder: number;
    currency: string;
    checkRates: number;
    rates: Record<string, number>;
}