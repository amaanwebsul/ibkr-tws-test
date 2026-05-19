import dotenv from "dotenv";
dotenv.config();

import express from "express";
import ibClient from "./ibkr/ibClient.js";
import accountRouter from "./routes/accountRoute.js";
import marketRouter from "./routes/marketRoute.js";
import positionRouter from "./routes/positionRoute.js";
import orderRouter from "./routes/orderRoute.js";

console.log(process.env.PORT, "PORT");

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

ibClient.connect();

app.use("/api/accounts", accountRouter);
app.use("/api/market", marketRouter);
app.use("/api/positions", positionRouter);
app.use("/api/orders", orderRouter);

app.get("/ping", (req, res) => {
  res.send("pong");
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});