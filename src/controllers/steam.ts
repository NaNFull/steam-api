import path from 'node:path';

import type { RequestHandler } from 'express';

import type { IExistingData, IGame, IKeyGame, ISteamSettings } from '../types/steam.types';
import { parseJSON } from '../utils/baseUtils';
import { getSettingsSteam, mergeResult, saveSettingsSteam, settingsSteamPath } from '../utils/steamUtils';
import Tradeit from './tradeit';

export default class Steam {
  readonly #settings: ISteamSettings;
  readonly #gameTypes: IGame = {
    CS2: 730,
    RUST: 252_490,
    TF2: 440
  };
  readonly #defaultSettings: ISteamSettings = {
    currency: 'RUB',
    defaultRates: ['EUR', 'GBP', 'RUB', 'PHP', 'AUD', 'BRL', 'HKD', 'JPY', 'MXN', 'THB', 'TRY', 'ILS'],
    profitPercent: 0.7,
    remainder: 2,
    typeGame: 'RUST'
  };

  public constructor() {
    this.#settings = getSettingsSteam() ?? this.#defaultSettings;
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
      const { profitPercent, remainder, typeGame, ...ops } = this.#settings;

      saveSettingsSteam({
        profitPercent: Number.parseFloat(req.body?.profitPercent ?? profitPercent),
        remainder: Number.parseInt(req.body?.remainder ?? remainder, 10),
        typeGame,
        ...ops
      });

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

  public onChangeData = (type?: IKeyGame): IExistingData => {
    const existingData: IExistingData = {};

    switch (type) {
      case 'TF2':
      case 'CS2':
      case 'RUST': {
        Object.assign(existingData, this.getExistingData('key', type));

        break;
      }
      default: {
        Object.assign(
          existingData,
          this.getExistingData('key', 'TF2'),
          this.getExistingData('key', 'CS2'),
          this.getExistingData('key', 'RUST')
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

        return path.join(settingsSteamPath, `steam.${gameID}.json`);
      }
    }

    return null;
  };
}
