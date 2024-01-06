import express from "express";
import TradeitController from "../controllers/tradeit";

const router = express.Router();

router.get("/Images", async ({ query: { gameId, imageId } }, res) => {
  if (!gameId || !imageId || typeof gameId !== "string" || typeof imageId !== "string" ) {
    res.status(400).send('Both gameId and imageId are required.');
    return;
  }

  try {
    const controller = new TradeitController();
    const { error, result, typeImage } = await controller.getImages(gameId, imageId);

    // Возвращаем ошибку от запроса
    if (error) {
      const [code, str] = error;

      res.status(code).send(str);

      return;
    }

    res.type(typeImage).end(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
