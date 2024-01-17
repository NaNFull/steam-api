import fs from 'node:fs';
import path from 'node:path';

import type { Response } from 'express';

const dataPath = path.join(__dirname, '../../data');

export async function fetchData<T = any>(url: string, res: Response) {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();

      return data as T;
    } else {
      // Если статус не ок, отправляем соответствующий статус и сообщение
      res.status(response.status).send(await response.text());
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

// Парсим JSON-файл
export const parseJSON = <T = any>(filePath: string) => {
  // Проверка существования папки data, и создание ее, если она не существует
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  }

  return null;
};

// Сохраняем JSON-объект в файл
export const saveJSON = (filePath: string, data: any) => {
  // Проверка существования папки data, и создание ее, если она не существует
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};
