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
  rarity: string;
  type: string;
  agent: string;
}
