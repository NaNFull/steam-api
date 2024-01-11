import {Response} from "express";

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