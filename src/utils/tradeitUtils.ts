import fs from 'node:fs';
import path from 'node:path';

import type { IRatesDefault, IRatesSteam } from '../types/steam.types';
import { parseJSON, saveJSON } from './baseUtils';

const dataPath = path.join(__dirname, '../../data');
const tradeitPath = path.join(dataPath, 'tradeit');
const ratesPath = path.join(tradeitPath, `temp.rates.json`);

export const getRates = () => {
  // Проверка существования папки tradeit, и создание ее, если она не существует
  if (!fs.existsSync(tradeitPath)) {
    fs.mkdirSync(tradeitPath);
  }

  return parseJSON<IRatesSteam>(ratesPath) ?? {};
};

export const saveRates = (data: IRatesSteam) => {
  // Проверка существования папки tradeit, и создание ее, если она не существует
  if (!fs.existsSync(tradeitPath)) {
    fs.mkdirSync(tradeitPath);
  }

  saveJSON(ratesPath, data);
};

export const filterRates = (defaultRates?: IRatesDefault[], rates?: Record<string, number>) => {
  const result: Record<string, number> = {};

  if (defaultRates) {
    for (const currency of defaultRates) {
      result[currency] = rates?.[currency] ?? 1;
    }
  }

  return result;
};
