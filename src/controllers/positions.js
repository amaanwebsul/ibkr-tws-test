import { once } from "events";
import ibClient from "../ibkr/ibClient.js";

export const getPositions = async (req, res) => {
  try {
    const ib = ibClient.getIB();

    const positions = [];

    const onPosition = (
      account,
      contract,
      position,
      avgCost
    ) => {
      positions.push({
        account,
        symbol: contract.symbol,
        exchange: contract.exchange,
        quantity: position,
        avgCost,
      });
    };

    ib.on("position", onPosition);

    ib.reqPositions();

    // Wait until positionEnd event fires
    await once(ib, "positionEnd");

    ib.cancelPositions();

    ib.off("position", onPosition);

    res.status(200).json(positions);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};