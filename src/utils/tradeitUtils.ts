import fs from "fs";
import {IRatesDefault, IRatesSteam} from "../types/steam.types";
import {parseJSON, saveJSON} from "./baseUtils";
import path from "path";

const dataPath = path.join(__dirname, '../../data');
const tradeitPath = path.join(dataPath, 'tradeit');
const ratesPath = path.join(tradeitPath, `temp.rates.json`);

export const getRatesSteam = () => {
    // Проверка существования папки tradeit, и создание ее, если она не существует
    if (!fs.existsSync(tradeitPath)) {
      fs.mkdirSync(tradeitPath);
    }

    return parseJSON<IRatesSteam>(ratesPath);
}

export const saveRatesSteam = (data: IRatesSteam) => {
    // Проверка существования папки tradeit, и создание ее, если она не существует
    if (!fs.existsSync(tradeitPath)) {
      fs.mkdirSync(tradeitPath);
    }

    saveJSON(ratesPath, data);
}

export const filterRates = (defaultRates: IRatesDefault[], rates?: Record<string, number>) => {
    return defaultRates.reduce((acc, currency) => {
      acc[currency] = rates?.[currency] ?? 1;
      return acc;
    }, {} as Record<IRatesDefault, number>);
}
