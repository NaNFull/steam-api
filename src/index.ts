import express, { Application } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import Router from "./routes";
import cors from "./middleware/cors.middleware";

const PORT = process.env.PORT || 3002;

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Добавляем заголовки CORS
app.use(cors);

// TODO: Доработать логику morgan
app.use(morgan("tiny"));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use('/api', Router);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
