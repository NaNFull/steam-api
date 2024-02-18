export interface IMainSettings {
  cacheTradeit: boolean;
  minPrice: number;
  maxPrice: number;
  profitPercent: number;
  remainder: number;
  typeGame: IKeyGame;
  currency: IRatesDefault;
  defaultRates: IRatesDefault[];
}

export type IGame = Record<IKeyGame, number>;

export type IKeyGame = 'TF2' | 'CS2' | 'RUST';

export type IRatesDefault =
  | 'EUR'
  | 'GBP'
  | 'RUB'
  | 'PHP'
  | 'AUD'
  | 'BRL'
  | 'HKD'
  | 'JPY'
  | 'MXN'
  | 'THB'
  | 'TRY'
  | 'ILS'
  | 'CNY';

export interface IRates {
  checkRates?: number;
  rates?: Record<string, number>;
}

export interface ItemData {
  id: number;
  groupId: number;
  prices: [number, number][];
  sitePrice: number;
  priceForTrade: number;
  metaMappings: {
    category: number;
    item: number;
  };
  imgURL: string;
  name: string;
  steamAppId: number;
  steamTags: string[];
  counts: number;
  updateDate: number;
  currentStock?: number;
  wantedStock?: number;
}

export type IExistingData = Record<string, ItemData>;

export interface IPriceHistory {
  id: number;
  date: number;
  priceUSD: number;
  priceUSDTM: number;
  priceTM: number;
  priceInCurrency: number;
}

export interface IResultItemData extends Omit<ItemData, 'prices'> {
  key: number;
  remainder: number;
  currency: string;
  prices: IPriceHistory[];
  priceUSD: number;
  priceUSDTM: number;
  priceTM: number;
  priceInCurrency: number;
}

export interface IResultData {
  items: IResultItemData[];
}
