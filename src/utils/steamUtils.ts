import path from 'node:path';

import type { IExistingData, IResultData, ISteamSettings } from '../types/steam.types';
import { parseJSON, saveJSON } from './baseUtils';

const dataPath = path.join(__dirname, '../../data');
const settingsPath = path.join(dataPath, `steam.settings.json`);

export const settingsSteamPath = dataPath;

export const getSettingsSteam = () => parseJSON<ISteamSettings>(settingsPath);

export const saveSettingsSteam = (data: ISteamSettings) => {
  saveJSON(settingsPath, data);
};

export const mergeResult = (existingData: IExistingData, resultRates: Record<string, number>): IResultData => {
  const { currency = 'RUB', profitPercent = 0.7, remainder = 2 } = getSettingsSteam() ?? {};

  return {
    items: Object.values(existingData).map(({ id, prices, ...opts }) => {
      const rate = resultRates[currency];
      const tempPrice = prices.map(([date, data], index) => ({
        date,
        id: index,
        priceInCurrency: (rate * data) / 100,
        priceTM: ((rate * data) / 100) * profitPercent,
        priceUSD: data / 100
      }));
      const { priceInCurrency, priceTM, priceUSD } = tempPrice[0];

      return {
        currency,
        id,
        key: id,
        priceInCurrency,
        priceTM,
        priceUSD,
        prices: tempPrice,
        remainder,
        ...opts
      };
    })
  };
};
