import path from 'node:path';

import dayjs from 'dayjs';
import type { RequestHandler } from 'express';
import isNil from 'lodash/isNil';

import type { ITradeitDataResponse } from '../types/tradeit.types';
import { fetchData, saveJSON } from '../utils/baseUtils';
import { getSettingsSteam, mergeResult } from '../utils/steamUtils';
import { filterRates, getRates, saveRates } from '../utils/tradeitUtils';
import SteamController from './steam';

export default class Tradeit {
  readonly #url = 'https://tradeit.gg';
  readonly #pathInventory: string;
  readonly #pathMyInventory: string;
  readonly #pathCurrencies: string;

  public constructor() {
    const apiRouter = 'api/v2';

    this.#pathInventory = path.join(this.#url, apiRouter, 'inventory');
    this.#pathMyInventory = path.join(this.#pathInventory, 'my/data?fresh=1');
    this.#pathCurrencies = path.join(this.#url, apiRouter, 'exchange-rate');
  }

  // TODO: разделить логику и оптимизировать решение
  public getData: RequestHandler = async ({ query: { gameId }, url }, res) => {
    const urlData = path.join(this.#pathInventory, url);

    if (!gameId || typeof gameId !== 'string') {
      console.error('Error: Отсутствует gameId:', gameId);
      res.status(500).send(`Internal Server Error - Отсутствует gameId: ${gameId}`);
      return;
    }

    const nowDateValue = dayjs().valueOf();
    const controller = new SteamController();
    const existingData = controller.getExistingData('value', gameId);
    const requestRates = this.fetchRates();
    const requestData = fetchData<ITradeitDataResponse>(urlData, res);

    const [resultData, resultRates] = await Promise.all([requestData, requestRates]);

    if (resultData) {
      for (const {
        groupId,
        id,
        imgURL,
        metaMappings,
        name,
        price,
        priceForTrade,
        sitePrice,
        steamAppId,
        steamTags
      } of resultData.items) {
        const item = existingData[id];

        if (item) {
          const [_, oldPrice] = item.prices[0];

          if (oldPrice !== price) {
            item.prices.unshift([nowDateValue, price]);
          }

          item.counts = resultData.counts[id];
        } else {
          existingData[id] = {
            counts: resultData.counts[id],
            groupId,
            id,
            imgURL,
            metaMappings,
            name,
            priceForTrade,
            prices: [[nowDateValue, price]],
            sitePrice,
            steamAppId,
            steamTags
          };
        }
      }
    }
    const result = mergeResult(existingData, resultRates);
    const gamePath = controller.getGamePath('value', gameId);

    // Сохраняем JSON-объект в файл
    if (gamePath) {
      saveJSON(gamePath, existingData);
    }

    res.json(result);
  };

  // TODO: В разработке
  public getMyData: RequestHandler = async (_req, res) => {
    const urlData = path.join(this.#url, this.#pathMyInventory);
    // const filePath = path.join(webPath, `tradeit.my.inventory.json`);
    //
    // // Проверка существования папки gameId, и создание ее, если она не существует
    // if (!fs.existsSync(webPath)) {
    //   fs.mkdirSync(webPath);
    // }

    try {
      const response = await fetch(urlData);

      if (response.ok) {
        // Получаем данные от целевого сервера
        const result = await response.json();

        res.json(result);
      } else {
        // Если статус не ок, отправляем соответствующий статус и сообщение
        res.status(response.status).send(await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error getMyData');
    }
  };

  public getCurrencies: RequestHandler = async (_req, res) => {
    const urlCurrencies = path.join(this.#url, this.#pathCurrencies);

    try {
      const response = await fetch(urlCurrencies);

      if (response.ok) {
        // Получаем данные от целевого сервера
        const result = await response.json();

        res.json(result);
      } else {
        // Если статус не ок, отправляем соответствующий статус и сообщение
        res.status(response.status).send(await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error getCurrencies');
    }
  };

  public fetchRates = async () => {
    const { defaultRates } = getSettingsSteam() ?? {};
    const { checkRates = 0, rates } = getRates();
    const nowDate = Date.now();

    try {
      if ((nowDate - checkRates) / 60 / 1000 > 60 || isNil(rates)) {
        const response = await fetch(this.#pathCurrencies);

        if (response.ok) {
          // Получаем данные от целевого сервера
          const data = await response.json();

          saveRates({
            checkRates: nowDate,
            rates: data.rates
          });

          return filterRates(defaultRates, data.rates as Record<string, number>);
        } else {
          // Если статус не ок, отправляем соответствующий статус и сообщение
          console.error('status:', response.status, 'info:', await response.text());
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }

    return filterRates(defaultRates, rates);
  };
}
