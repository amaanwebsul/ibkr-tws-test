import express from "express";
import { getStockPrice } from "../ibkr/marketData.js";

const router = express.Router();

router.get("/price/:symbol", getStockPrice)
//   async (req, res) => {

//     const data =
//       await getStockPrice(
//         req.params.symbol
//       );

//     res.json(data);
//   }
// );

export default router;