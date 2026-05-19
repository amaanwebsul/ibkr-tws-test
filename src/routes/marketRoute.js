import express from "express";
import { getStockPrice } from "../controllers/marketData.js";

const router = express.Router();

router.get("/price/:symbol", getStockPrice)

export default router;