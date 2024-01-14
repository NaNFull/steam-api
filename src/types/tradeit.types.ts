export interface ITradeitDataResponse {
  items: Item[];
  counts: Record<string, number>;
  badBots: number[];
  activeBots: string[];
  bestAvailableBotsMax: number;
}

export interface Item {
  assetLength: number;
  price: number;
  priceForTrade: number;
  metaMappings: MetaMappings;
  imgURL: string;
  name: string;
  phase: null;
  score: number;
  steamAppId: number;
  steamTags: string[];
  createdAt: Date;
  tradedAt: Date;
  groupId: number;
  classId: string;
  assetId: string;
  steamId: string;
  sitePrice: number;
  id: number;
  hasStickers: boolean;
  hasStattrak: boolean;
  floatValues: number[];
  botIndex: number;
  botIndexes: number[];
  colors: any[];
  stickers: any[];
  tradeLockDay: any[];
  _id: string;
}

export interface MetaMappings {
  category: number;
  item: number;
  rarity: string; // Add missing properties
  type: string;
  agent: string;
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
  currentStock?: number;
  wantedStock?: number;
}

export type DataTradeit = Record<string, ItemData>;

export interface IPriceHistory {
  id: number;
  date: number;
  priceUSD: number;
  priceTM: number;
  priceInCurrency: number;
}

export interface IResultItemData extends Omit<ItemData, 'prices'> {
  key: number;
  remainder: number;
  currency: string;
  prices: IPriceHistory[];
  priceUSD: number;
  priceInCurrency: number;
  priceTM: number;
}

export interface IResultData {
  items: IResultItemData[];
}

// TODO: Сравнить типы с ITradeitDataResponse
export interface IResponseData {
  items: Item[];
  counts: Record<string, number>;
  badBots: number[];
  activeBots: string[];
  bestAvailableBotsMax: number;
}

export interface Item {
  assetLength: number;
  price: number;
  priceForTrade: number;
  metaMappings: MetaMappings;
  imgURL: string;
  name: string;
  phase: null;
  score: number;
  steamAppId: number;
  steamTags: string[];
  createdAt: Date;
  tradedAt: Date;
  groupId: number;
  classId: string;
  assetId: string;
  steamId: string;
  sitePrice: number;
  id: number;
  hasStickers: boolean;
  hasStattrak: boolean;
  floatValues: number[];
  botIndex: number;
  botIndexes: number[];
  colors: any[];
  stickers: any[];
  tradeLockDay: any[];
  _id: string;
}

export interface MetaMappings {
  category: number;
  item: number;
  rarity: string; // Add missing properties
  type: string;
  agent: string;
}
