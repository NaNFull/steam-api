import path from "path";
import fs from "fs";
import {Buffer} from "buffer";
import { Request, Response, RequestHandler } from 'express';

const imagePath = path.join(__dirname, '../../cache/Tradeit');

// TODO: Временное решение по кешированию картинок, заменить в будущем на Service workers
// Проверка существования папки Tradeit, и создание ее, если она не существует
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath);
}

export default class TradeitController {
  #urlOld = 'https://old.tradeit.gg';
  #url = 'https://tradeit.gg';

  public getImages: RequestHandler = async ({ query: { gameId, imageId } }, res) => {
    if (!gameId || !imageId || typeof gameId !== "string" || typeof imageId !== "string" ) {
      res.status(400).send('Both gameId and imageId are required.');
      return;
    }
    const gameImagePath = path.join(imagePath, gameId);
    const imageFilePath = path.join(gameImagePath, `${imageId}.webp`);
    const url = new URL('/static/img/items-webp-256', this.#urlOld);

    url.pathname = path.join(url.pathname, `${imageId}.webp`);

    // TODO: Временное решение по кешированию картинок, заменить в будущем на Service workers
    // Проверка существования папки gameId, и создание ее, если она не существует
    if (!fs.existsSync(gameImagePath)) {
      fs.mkdirSync(gameImagePath);
    }
    // Если файл существует, отправляем его в ответе
    if (fs.existsSync(imageFilePath)) {
      res.type('image/webp').end(fs.readFileSync(imageFilePath));

      return;
    }

    try {
      const response = await fetch(url);

      console.log('fetch: ', imageId);

      if (!response.ok) {
        // Если статус не ок, отправляем соответствующий статус и сообщение
        res.status(response.status).send(await response.text());
      }

      const contentType = response.headers.get('content-type') ?? '';

      // В данном случае не обязательно поддерживать все форматы изображении
      if (!contentType.includes('image/webp')) {
        // Возвращаем ошибку, так как контент не является изображением webp
        res.type(contentType).status(415).send('Unsupported Media Type: Not an image webp');

        return;
      }

      // Получаем данные в виде Blob
      const resultBlob = Buffer.from(await response.arrayBuffer());

      // TODO: Временное решение по кешированию картинок, заменить в будущем на Service workers
      // Сохраняем изображение на сервере
      fs.writeFileSync(imageFilePath, resultBlob);

      res.type('image/webp').end(resultBlob);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public getData: RequestHandler = async (_req, res) => {
    const temp2 = 'https://tradeit.gg/api/v2/inventory/data?gameId=730&offset=0&limit=120&sortType=Popularity&searchValue=&minPrice=0&maxPrice=100000&minFloat=0&maxFloat=1&type=1&showTradeLock=true&colors=&showUserListing=true&fresh=true&isForStore=0'

    try {
      const response = await fetch(temp2);

      if (response.ok) {
        // Получаем данные от целевого сервера
        const result = await response.json();
        console.log(result)

        res.json(result);
      } else {
        // Если статус не ок, отправляем соответствующий статус и сообщение
        res.status(response.status).send(await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public getMyData: RequestHandler = async (_req, res) => {
    const temp2 = 'https://tradeit.gg/api/v2/inventory/my/data?fresh=1'

    try {
      const response = await fetch(temp2);

      if (response.ok) {
        // Получаем данные от целевого сервера
        const result = await response.json();
        console.log(result)

        res.json(result);
      } else {
        // Если статус не ок, отправляем соответствующий статус и сообщение
        res.status(response.status).send(await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  public getCurrencies: RequestHandler = async (_req, res) => {
    const temp2 = 'https://tradeit.gg/api/v2/exchange-rate'

    try {
      const response = await fetch(temp2);

      if (response.ok) {
        // Получаем данные от целевого сервера
        const result = await response.json();
        console.log(result)

        res.json(result);
      } else {
        // Если статус не ок, отправляем соответствующий статус и сообщение
        res.status(response.status).send(await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
