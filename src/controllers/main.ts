import path from 'node:path';

import type { RequestHandler } from 'express';

import type { IExistingData, IExistingDataCS2, IKeyGame, IMainSettings } from '../types/main.types';
import { parseJSON } from '../utils/baseUtils';
import { getSettingsMain, mergeResult, saveSettingsMain, settingsMainPath } from '../utils/mainUtils';
import Tradeit from './tradeit';

export default class Main {
  readonly #settings: IMainSettings;

  readonly #defaultSettings: IMainSettings = {
    cacheTradeit: false,
    currency: 'RUB',
    defaultRates: ['EUR', 'GBP', 'RUB', 'CNY', 'TRY', 'JPY', 'PHP', 'AUD', 'BRL', 'HKD', 'MXN', 'THB', 'ILS'],
    maxPrice: 100_000,
    minPrice: 0,
    profitPercent: 0.7,
    remainder: 2,
    typeGame: 252_490,
  };

  public constructor() {
    this.#settings = getSettingsMain() ?? this.#defaultSettings;
  }

  public getData: RequestHandler = async (_req, res) => {
    try {
      const { typeGame } = this.#settings;
      const existingData = this.onChangeData(typeGame);

      const model = new Tradeit();
      const resultRates = await model.fetchRates();
      const result = mergeResult(existingData, resultRates);

      res.json(result);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  public postData: RequestHandler = async (req, res) => {
    try {
      this.#settings.cacheTradeit = req.body?.cacheTradeit ?? this.#settings.cacheTradeit;
      this.#settings.currency = req.body?.currency ?? this.#settings.currency;
      this.#settings.maxPrice = req.body?.maxPrice ?? this.#settings.maxPrice;
      this.#settings.minPrice = req.body?.minPrice ?? this.#settings.minPrice;
      this.#settings.profitPercent = (req.body?.profitPercent ?? this.#settings.profitPercent) / 100;
      this.#settings.remainder = req.body?.remainder ?? this.#settings.remainder;
      this.#settings.typeGame = req.body?.gameId ?? this.#settings.typeGame;

      saveSettingsMain(this.#settings);

      const existingData = this.onChangeData(this.#settings.typeGame);

      const model = new Tradeit();
      const resultRates = await model.fetchRates();
      const result = mergeResult(existingData, resultRates);

      res.json(result);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  public getFilters: RequestHandler = async (_req, res) => {
    try {
      const tempSettings = getSettingsMain() ?? this.#settings;
      const { cacheTradeit, currency, maxPrice, minPrice, profitPercent, remainder, typeGame } = tempSettings;

      const model = new Tradeit();
      const resultRates = await model.fetchRates();

      res.json({
        cacheTradeit,
        currencies: resultRates,
        currency,
        gameId: typeGame,
        maxPrice,
        minPrice,
        profitPercent: profitPercent * 100,
        remainder,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  public onChangeData = (type?: IKeyGame): IExistingData => {
    const existingData: IExistingData = {};

    switch (type) {
      case 730:
      case 252_490:
      case 440:
      case 753: {
        Object.assign(existingData, this.getExistingData(type));

        break;
      }
      default: {
        Object.assign(
          existingData,
          this.getExistingData(730),
          this.getExistingData(252_490),
          this.getExistingData(440),
          this.getExistingData(753),
        );
      }
    }

    return existingData;
  };

  public getExistingData = (gameID: IKeyGame): IExistingData | IExistingDataCS2 => {
    const gamePath = this.getGamePath(gameID);

    if (gameID === 730) {
      return parseJSON<IExistingDataCS2>(gamePath) ?? {};
    }

    return parseJSON<IExistingData>(gamePath) ?? {};
  };

  public getGameId = (name: string): IKeyGame | null => {
    const id = Number.parseInt(name, 10);
    switch (id) {
      case 730:
      case 252_490:
      case 440:
      case 753: {
        return id;
      }
    }
    return null;
  };

  public getGamePath = (gameID: IKeyGame) => path.join(settingsMainPath, `skins.${gameID}.json`);
}
