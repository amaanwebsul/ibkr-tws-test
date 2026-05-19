import express from "express";
import { buyStock, cancelOrder, getOpenOrders } from "../controllers/orders.js";

const router = express.Router();

router.get("/get", getOpenOrders);
router.post("/buy", buyStock);
router.delete("/cancel/:id", cancelOrder);

export default router;