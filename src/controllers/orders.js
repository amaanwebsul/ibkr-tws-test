import { once } from "events";

import ibClient from "../ibkr/ibClient.js";

export const buyStock = async (req, res) => {
  try {

    const {
      symbol,
      quantity = 1
    } = req.body;

    const ib =
      ibClient.getIB();

    const orderId =
      ibClient.getNextOrderId();

    const contract = {
      symbol:
        symbol.toUpperCase(),

      secType:
        "STK",

      exchange:
        "SMART",

      currency:
        "USD",
    };

    const order = {
      action:
        "BUY",

      totalQuantity:
        quantity,

      orderType:
        "MKT",

      tif:
        "DAY",

      transmit:
        true,
    };

    console.log(
      `Placing order for ${symbol}`
    );

    // Place order
    ib.placeOrder(
      orderId,
      contract,
      order
    );

    const orderResponse =
      await new Promise(
        (
          resolve,
          reject
        ) => {

          const timeout =
            setTimeout(
              () => {

                cleanup();

                reject(
                  new Error(
                    "Order status timeout"
                  )
                );
              },
              10000
            );

          const onOrderStatus =
            (
              id,
              status,
              filled,
              remaining,
              avgFillPrice
            ) => {

              // Ignore other orders
              if (
                id !==
                orderId
              ) {
                return;
              }

              console.log({
                id,
                status,
                filled,
                remaining,
                avgFillPrice
              });

              // Valid statuses
              const validStatuses = [
                "PreSubmitted",
                "Submitted",
                "Filled"
              ];

              if (
                validStatuses.includes(
                  status
                )
              ) {

                cleanup();

                resolve({
                  orderId:
                    id,

                  symbol:
                    symbol.toUpperCase(),

                  status,

                  filled,

                  remaining,

                  avgFillPrice
                });
              }
            };

          const cleanup =
            () => {

              clearTimeout(
                timeout
              );

              ib.off(
                "orderStatus",
                onOrderStatus
              );
            };

          ib.on(
            "orderStatus",
            onOrderStatus
          );
        }
      );

    res.status(200)
      .json(
        orderResponse
      );

  } catch (
  error
  ) {

    console.error(
      error
    );

    res.status(500)
      .json({
        error:
          error.message
      });
  }
};

export const getOpenOrders = async (req, res) => {
  try {
    const ib = ibClient.getIB();

    const orders = [];

    const onOrder =
      (
        orderId,
        contract,
        order,
        orderState
      ) => {

        orders.push({
          orderId,

          symbol:
            contract.symbol,

          action:
            order.action,

          quantity:
            order.totalQuantity,

          orderType:
            order.orderType,

          status:
            orderState.status,
        });
      };

    ib.on("openOrder", onOrder);

    ib.reqOpenOrders();

    await once(
      ib,
      "openOrderEnd"
    );

    ib.off(
      "openOrder",
      onOrder
    );

    res.status(200)
      .json(
        orders
      );

  } catch (
  error
  ) {

    res.status(500)
      .json({
        error:
          error.message
      });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const ib = ibClient.getIB();

    // Send cancel request
    ib.cancelOrder(
      orderId
    );

    // Wait for status update
    const [
      id,
      status
    ] = await once(
      ib,
      "orderStatus"
    );

    res.status(200)
      .json({
        orderId: id,
        status,
      });

  } catch (
  error
  ) {

    res.status(500)
      .json({
        error:
          error.message
      });
  }
};