import path from "path";
import fs from "fs";
import {Buffer} from "buffer";
import {ImagesResponse} from "./types";

const imagePath = path.join(__dirname, '../../cache/Tradeit');

// TODO: Временное решение по кешированию картинок, заменить в будущем на Service workers
// Проверка существования папки Tradeit, и создание ее, если она не существует
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath);
}

export default class TradeitController {
  #urlOld = 'https://old.tradeit.gg';
  #url = 'https://tradeit.gg';

  public async getImages(gameId: string, imageId: string): Promise<ImagesResponse> {
    const gameImagePath = path.join(imagePath, gameId);
    const imageFilePath = path.join(gameImagePath, `${imageId}.webp`);

    // TODO: Временное решение по кешированию картинок, заменить в будущем на Service workers
    // Проверка существования папки gameId, и создание ее, если она не существует
    if (!fs.existsSync(gameImagePath)) {
      fs.mkdirSync(gameImagePath);
    }
    // Если файл существует, отправляем его в ответе
    if (fs.existsSync(imageFilePath)) {
      return {
        typeImage: 'image/webp',
        result: fs.readFileSync(imageFilePath)
      };
    }

    console.log('fetch: ', imageId);

    const url = new URL('/static/img/items-webp-256', this.#urlOld);

    url.pathname = path.join(url.pathname, `${imageId}.webp`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    // В данном случае не обязательно поддерживать все форматы изображении
    if (!contentType.includes('image/webp')) {
      // Возвращаем ошибку, так как контент не является изображением webp
      return {
        typeImage: contentType,
        error: [415, 'Unsupported Media Type: Not an image webp']
      };
    }

    // Получаем данные в виде Blob
    const resultBlob = Buffer.from(await response.arrayBuffer());

    // TODO: Временное решение по кешированию картинок, заменить в будущем на Service workers
    // Сохраняем изображение на сервере
    fs.writeFileSync(imageFilePath, resultBlob);

    return {
      typeImage: contentType,
      result: resultBlob
    };
  }
}
