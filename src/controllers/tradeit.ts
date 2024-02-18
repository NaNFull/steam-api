import { join as joinPath } from 'node:path/posix';

import dayjs from 'dayjs';
import type { RequestHandler } from 'express';
import isNil from 'lodash/isNil';

import type { ITradeitDataResponse } from '../types/tradeit.types';
import { fetchData, saveJSON } from '../utils/baseUtils';
import { getSettingsSteam } from '../utils/steamUtils';
import { filterRates, getRates, saveRates } from '../utils/tradeitUtils';
import SteamController from './steam';

export default class Tradeit {
  readonly #url = new URL('https://tradeit.gg');
  readonly #urlInventory = new URL(this.#url);
  readonly #urlMyInventory = new URL(this.#url);
  readonly #urlCurrencies = new URL(this.#url);

  public constructor() {
    const apiRouter = 'api/v2';

    this.#urlInventory.href = joinPath(this.#urlInventory.href, apiRouter, 'inventory');
    this.#urlMyInventory.href = joinPath(this.#urlInventory.href, 'my/data?fresh=1');
    this.#urlCurrencies.href = joinPath(this.#urlCurrencies.href, apiRouter, 'exchange-rate');
  }

  // TODO: разделить логику и оптимизировать решение
  public getData: RequestHandler = async ({ query: { gameId, offset }, url, ...ops }, res) => {
    const urlData = new URL(this.#urlInventory);

    urlData.href = joinPath(urlData.href, url);

    if (!gameId || typeof gameId !== 'string') {
      console.error('Error: Отсутствует gameId:', gameId);
      res.status(500).send(`Internal Server Error - Отсутствует gameId: ${gameId}`);
      return;
    }

    const nowDateValue = dayjs().valueOf();
    const controller = new SteamController();
    const existingData = controller.getExistingData('value', gameId);
    const parseOffset = typeof offset === 'string' ? Number.parseInt(offset, 10) : 0;
    let tempOffset = 0;

    while (tempOffset < parseOffset) {
      urlData.searchParams.set('offset', tempOffset.toString());
      const resultData = await fetchData<ITradeitDataResponse>(urlData.href, res);

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
            item.updateDate = nowDateValue;
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
              steamTags,
              updateDate: nowDateValue
            };
          }
        }
      }
      const gamePath = controller.getGamePath('value', gameId);

      // Сохраняем JSON-объект в файл
      if (gamePath) {
        saveJSON(gamePath, existingData);
      }
      console.log('GET :', resultData?.items.length, 'URL:', urlData.href);

      if (resultData && resultData.items.length === 500) {
        tempOffset += 500;
      } else {
        tempOffset = parseOffset;
      }

      // Delay for 1 second
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }

    res.json(true);
  };

  // TODO: В разработке
  public getMyData: RequestHandler = async (_req, res) => {
    const urlData = this.#urlMyInventory.href;
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
    const urlCurrencies = this.#urlCurrencies.href;

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
        const response = await fetch(this.#urlCurrencies);

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
