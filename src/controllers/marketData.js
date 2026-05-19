import ibClient from "../ibkr/ibClient.js";

export const getStockPrice = async (req, res) => {
    try {
      const symbol = req.params.symbol;

      const ib = ibClient.getIB();

      const tickerId = ibClient.getNextRequestId();

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

      // delayed data
      ib.reqMarketDataType(
        3
      );

      const data =
        await new Promise(
          (
            resolve,
            reject
          ) => {

            const timeout =
              setTimeout(
                () => {

                  ib.removeListener(
                    "tickPrice",
                    tickHandler
                  );

                  reject(
                    new Error(
                      "Timeout fetching market data"
                    )
                  );

                },
                10000
              );

            const tickHandler =
              (
                reqId,
                field,
                price
              ) => {

                if (
                  reqId !==
                  tickerId
                )
                  return;

                console.log({
                  field,
                  price,
                });

                const validFields =
                  [
                    4,
                    75,
                  ];

                if (
                  validFields.includes(
                    field
                  ) &&
                  price > 0
                ) {

                  clearTimeout(
                    timeout
                  );

                  ib.cancelMktData(
                    tickerId
                  );

                  ib.removeListener(
                    "tickPrice",
                    tickHandler
                  );

                  resolve({
                    symbol:
                      symbol.toUpperCase(),

                    price,

                    delayed:
                      field ===
                      75,
                  });
                }
              };

            ib.on(
              "tickPrice",
              tickHandler
            );

            ib.reqMktData(
              tickerId,
              contract,
              "",
              false,
              false
            );
          }
        );

      res.json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };