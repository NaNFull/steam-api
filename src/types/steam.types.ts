export interface ISteamSettings {
    profitPercent: number;
    remainder: number;
    currency: IRatesDefault;
    defaultRates: IRatesDefault[]
}

export type IRatesDefault = 'EUR' | 'GBP' | 'RUB' | 'PHP' | 'AUD' | 'BRL' | 'HKD' | 'JPY' | 'MXN' | 'THB' | 'TRY' | 'ILS'

export interface IRatesSteam {
    checkRates?: number;
    rates?: Record<string, number>;
}
