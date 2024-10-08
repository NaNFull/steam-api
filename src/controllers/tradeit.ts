import { join as joinPath } from 'node:path/posix';

import dayjs from 'dayjs';
import type { RequestHandler } from 'express';
import isNil from 'lodash/isNil';

import type { IExistingData, IExistingDataCS2 } from '../types/main.types';
import type { ITradeitDataResponse } from '../types/tradeit.types';
import { fetchData, saveJSON } from '../utils/baseUtils';
import { getSettingsMain } from '../utils/mainUtils';
import { filterRates, getRates, saveRates } from '../utils/tradeitUtils';
import MainController from './main';

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
  public getData: RequestHandler = async ({ query: { gameId: queryGameId, limit, offset }, url, ...ops }, res) => {
    const urlData = new URL(this.#urlInventory);

    urlData.href = joinPath(urlData.href, url);

    if (!queryGameId || typeof queryGameId !== 'string') {
      console.error('Error: Отсутствует gameId:', queryGameId);
      res.status(500).send(`Internal Server Error - Отсутствует gameId: ${queryGameId}`);
      return;
    }

    const controller = new MainController();
    const gameId = controller.getGameId(queryGameId);

    if (!gameId) {
      console.error('Error: Нет такого gameId:', queryGameId);
      res.status(500).send(`Internal Server Error - Нет такого gameId: ${queryGameId}`);
      return;
    }

    const nowDateValue = dayjs().valueOf();
    const existingData = controller.getExistingData(gameId);
    const cacheData: IExistingData | IExistingDataCS2 = {};
    const parseOffset = typeof offset === 'string' ? Number.parseInt(offset, 10) : 0;
    const tempLimit = typeof limit === 'string' ? Number.parseInt(limit, 10) : 500;
    let tempOffset = 0;
    let countsData = 0;

    while (tempOffset < parseOffset) {
      urlData.searchParams.set('offset', tempOffset.toString());

      if (parseOffset - tempOffset < tempLimit) {
        urlData.searchParams.set('limit', (parseOffset - tempOffset).toString());
      } else if (parseOffset - tempOffset < 5) {
        urlData.searchParams.set('limit', '10');
      } else {
        urlData.searchParams.set('limit', '500');
      }

      const resultData = await fetchData<ITradeitDataResponse>(urlData.href, res);

      if (resultData) {
        for (const {
          floatValues,
          groupId,
          hasStickers,
          id,
          imgURL,
          metaMappings,
          name,
          price,
          priceForTrade,
          sitePrice,
          steamAppId,
          steamTags,
          stickers,
          tradeLockDay,
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
              imgURL: imgURL ?? `https://old.tradeit.gg/static/img/items-webp-256/${id}.webp`,
              metaMappings,
              name,
              priceForTrade,
              prices: [[nowDateValue, price]],
              sitePrice,
              steamAppId,
              steamTags,
              updateDate: nowDateValue,
              ...(gameId === 730
                ? {
                    floatValues,
                    hasStickers,
                    skins: [],
                    stickers,
                    tradeLockDay,
                  }
                : undefined),
            };
          }
          Object.assign(cacheData, { [id]: existingData[id] });
        }
      }

      if (resultData && resultData.items.length > 0) {
        countsData += resultData.items.length;
        tempOffset += resultData.items.length;
      } else {
        tempOffset = parseOffset;
      }

      // Delay for 1 second
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }

    const gamePath = controller.getGamePath(gameId);
    const cachePath = controller.getCachePath();

    if (gamePath) {
      saveJSON(gamePath, existingData);
      saveJSON(cachePath, cacheData);
    }

    res.json(countsData);
  };

  public getClearCache: RequestHandler = (_req, res) => {
    const controller = new MainController();
    const cachePath = controller.getCachePath();

    try {
      saveJSON(cachePath, {});
      res.json(true); // Отправляем true если очистка кэша прошла успешно
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error'); // Отправляем ошибку, если что-то пошло не так
    }
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
    const { defaultRates } = getSettingsMain() ?? {};
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
            rates: data.rates,
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
