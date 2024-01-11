import fs from "fs";

export interface IWebData {
  id: number;
  name: string;
  count: number;
  steamAppId: number;
  priceUSD: number;
  priceInCurrency: string;
  priceTM: string;
  image: string;
}

// export const mergeData = (fileData: IWebData, response: IWebData): IWebData => {
//     return;
// }

// Преобразование даты в UNIX timestamp
export const dateToTimestamp = (date: Date) => {
  return Math.floor(date.getTime() / 1000); // делим на 1000, чтобы получить секунды вместо миллисекунд
}

// Преобразование UNIX timestamp в дату
export const timestampToDate = (timestamp: number) => {
  return new Date(timestamp * 1000); // умножаем на 1000, чтобы получить миллисекунды
}

// Парсим JSON-файл
export const parseJSON = <T = any>(filePath: string) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  }

  return {} as T;
}

// Сохраняем JSON-объект в файл
export const saveJSON = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
