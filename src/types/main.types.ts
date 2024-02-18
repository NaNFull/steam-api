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

export type IKeyGame = 730 | 252_490 | 440 | 753;

export type IValueGame = 'CS2' | 'RUST' | 'TF2' | 'STEAM';

export type IGame = Record<IKeyGame, IValueGame>;

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

export interface IPriceHistory {
  id: number;
  date: number;
  priceUSD: number;
  priceUSDTM: number;
  priceTM: number;
  priceInCurrency: number;
}

export interface IResultData {
  items: IResultItemData[];
}
