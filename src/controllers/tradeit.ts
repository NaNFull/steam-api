import path from "path";
import { RequestHandler } from 'express';
import {DataTradeit, IResultData, ITradeitDataResponse} from "../types/tradeit.types";
import {
  getSettingsSteam,
  parseJSON,
  saveJSON,
  settingsSteamPath
} from "../utils/baseUtils";
import {fetchData} from "../utils/baseUtils";
import dayjs from "dayjs";
import isNil from "lodash/isNil";
import {filterRates, getRatesSteam, saveRatesSteam} from "../utils/tradeitUtils";

export default class Tradeit {
  readonly #urlOld = 'https://old.tradeit.gg';
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
  public getData: RequestHandler = async ({ url, query: { gameId } }, res) => {
    const urlData = path.join(this.#pathInventory, url);

    if (!gameId || typeof gameId !== 'string') {
      console.error('Error: Отсутствует gameId:', gameId);
      res.status(500).send(`Internal Server Error - Отсутствует gameId: ${gameId}`);
      return;
    }

    const nowDateValue = dayjs().valueOf();
    const filePath = path.join(settingsSteamPath, `steam.${gameId}.json`);
    const existingData: DataTradeit = parseJSON(filePath);
    const requestRates = this.fetchRates();
    const requestData = fetchData<ITradeitDataResponse>(urlData, res);

    const [
      resultData,
      resultRates
    ] = await Promise.all([requestData, requestRates]);

    if (resultData) {
      resultData.items.map(({
        id,
        price,
        metaMappings,
        imgURL,
        priceForTrade,
        name,
        steamAppId,
        steamTags,
        sitePrice,
        groupId
      }) => {
        let item = existingData[id];

        if (item) {
          const [_, oldPrice] = item.prices[0];

          if (oldPrice !== price) {
            item.prices.unshift([nowDateValue, price]);
          }
          item.counts = resultData.counts[id];

        } else {
          existingData[id] = {
            id,
            groupId,
            prices: [[nowDateValue, price]],
            sitePrice,
            priceForTrade,
            metaMappings,
            imgURL,
            name,
            steamAppId,
            steamTags,
            counts: resultData.counts[id]
          }
        }
      });
    }

    const { profitPercent, currency, remainder } = getSettingsSteam();
    const result: IResultData = {
      items: Object.values(existingData).map(({
        id,
        prices,
        ...opts
      }) => {
        const rate = resultRates[currency];
        const tempPrice = prices.map(([date, data], index) => ({
          id: index,
          date,
          priceInCurrency: (rate * data) / 100,
          priceTM: (rate * data) / 100 * profitPercent,
          priceUSD: data / 100
        }));
        const { priceTM, priceInCurrency, priceUSD } = tempPrice[0];

        return {
          currency,
          id,
          key: id,
          prices: tempPrice,
          priceTM,
          priceUSD,
          priceInCurrency,
          remainder,
          ...opts
        };
      })
    }

    // Сохраняем JSON-объект в файл
    saveJSON(filePath, existingData);

    res.json(result);
  }

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
  }

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
  }

  // TODO: Оптимизировать код
  public fetchRates = async () => {
    const { defaultRates } = getSettingsSteam();
    const { checkRates = 0, rates } = getRatesSteam();
    const nowDate = new Date().valueOf();

    try {
      if ((nowDate - checkRates) / 60 / 1000 > 60 ||  isNil(rates)) {
        const response = await fetch(this.#pathCurrencies);

        if (response.ok) {
          // Получаем данные от целевого сервера
          const data = await response.json();

          saveRatesSteam({
            checkRates: nowDate,
            rates: data.rates
          })

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
  }
}
