import path from 'node:path';

import type { RequestHandler } from 'express';

import type { IExistingData, IGame, IKeyGame, IMainSettings } from '../types/main.types';
import { parseJSON } from '../utils/baseUtils';
import { getSettingsMain, mergeResult, saveSettingsMain, settingsMainPath } from '../utils/mainUtils';
import Tradeit from './tradeit';

export default class Main {
  readonly #settings: IMainSettings;
  readonly #gameTypes: IGame = {
    CS2: 730,
    RUST: 252_490,
    STEAM: 753,
    TF2: 440,
  };
  readonly #defaultSettings: IMainSettings = {
    cacheTradeit: false,
    currency: 'RUB',
    defaultRates: ['EUR', 'GBP', 'RUB', 'CNY', 'TRY', 'JPY', 'PHP', 'AUD', 'BRL', 'HKD', 'MXN', 'THB', 'ILS'],
    maxPrice: 100_000,
    minPrice: 0,
    profitPercent: 0.7,
    remainder: 2,
    typeGame: 'RUST',
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
      const { cacheTradeit, currency, maxPrice, minPrice, profitPercent, remainder, typeGame, ...ops } = this.#settings;

      saveSettingsMain({
        cacheTradeit: req.body?.cacheTradeit ?? cacheTradeit,
        currency: req.body?.currency ?? currency,
        maxPrice: req.body?.maxPrice ?? maxPrice,
        minPrice: req.body?.minPrice ?? minPrice,
        profitPercent: (req.body?.profitPercent ?? profitPercent) / 100,
        remainder: req.body?.remainder ?? remainder,
        typeGame: req.body?.gameId ?? typeGame,
        ...ops,
      });

      console.log('type', typeGame);
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
      case 'TF2':
      case 'CS2':
      case 'RUST':
      case 'STEAM': {
        Object.assign(existingData, this.getExistingData('key', type));

        break;
      }
      default: {
        Object.assign(
          existingData,
          this.getExistingData('key', 'TF2'),
          this.getExistingData('key', 'CS2'),
          this.getExistingData('key', 'RUST'),
        );
      }
    }

    return existingData;
  };

  public getExistingData = (searchType: 'key' | 'value', data?: string): IExistingData => {
    const gamePath = this.getGamePath(searchType, data);

    if (gamePath) {
      return parseJSON<IExistingData>(gamePath) ?? {};
    }

    return {};
  };

  // Данный механизм позволяет вывести путь к файлу по значению data (IKeyGame или IValueGame)
  public getGamePath = (searchType: 'key' | 'value', data?: string) => {
    if (data) {
      let gameKey: IKeyGame | null = null;

      if (searchType === 'value') {
        const gameType = Number.parseInt(data, 10);
        const keys = Object.keys(this.#gameTypes) as IKeyGame[];
        const typeKey = keys.find((key) => gameType === this.#gameTypes[key]);

        if (typeKey) {
          gameKey = typeKey;
        }
      } else if (searchType === 'key') {
        gameKey = data as IKeyGame;
      }
      if (gameKey && this.#gameTypes[gameKey]) {
        const gameID = this.#gameTypes[gameKey];

        return path.join(settingsMainPath, `skins.${gameID}.json`);
      }
    }

    return null;
  };
}
