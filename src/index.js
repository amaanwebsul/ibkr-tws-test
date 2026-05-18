import dotenv from "dotenv";
dotenv.config();

import express from "express";
import ibClient from "./ibkr/ibClient.js";
import accountRouter from "./routes/accountRoute.js";
import marketRouter from "./routes/marketRoute.js";

console.log(process.env.PORT, "PORT");


const PORT = process.env.PORT;

const app = express();

app.use(express.json());

ibClient.connect();

app.use("/api", accountRouter);
app.use("/api", marketRouter);

app.get("/ping", (req, res) => {
  res.send("pong");
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});