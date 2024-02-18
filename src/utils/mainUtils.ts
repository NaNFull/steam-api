import path from 'node:path';

import type { IExistingData, IMainSettings, IResultData } from '../types/main.types';
import { parseJSON, saveJSON } from './baseUtils';

const dataPath = path.join(__dirname, '../../data');
const settingsPath = path.join(dataPath, 'main.settings.json');

export const settingsMainPath = dataPath;

export const getSettingsMain = () => parseJSON<IMainSettings>(settingsPath);

export const saveSettingsMain = (data: IMainSettings) => {
  saveJSON(settingsPath, data);
};

export const mergeResult = (existingData: IExistingData, resultRates: Record<string, number>): IResultData => {
  const { currency = 'RUB', profitPercent = 0.7, remainder = 2 } = getSettingsMain() ?? {};

  return {
    items: Object.values(existingData).map(({ id, prices, ...opts }) => {
      const rate = resultRates[currency];
      const tempPrice = prices.map(([date, data], index) => ({
        date,
        id: index,
        priceInCurrency: (rate * data) / 100,
        priceTM: ((rate * data) / 100) * profitPercent,
        priceUSD: data / 100,
        priceUSDTM: (data / 100) * profitPercent,
      }));
      const { priceInCurrency, priceTM, priceUSD, priceUSDTM } = tempPrice[0];

      return {
        currency,
        id,
        key: id,
        priceInCurrency,
        priceTM,
        priceUSD,
        priceUSDTM,
        prices: tempPrice,
        remainder,
        ...opts,
      };
    }),
  };
};
