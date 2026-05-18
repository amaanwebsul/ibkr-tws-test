import ibClient from "./ibClient.js";

export const getManagedAccounts = (req, res) => {
  try {
    const ib = ibClient.getIB();

    ib.once("managedAccounts", (accountsList) => {
      res.status(200).json({
        accounts: accountsList
      });
    });

    ib.reqManagedAccts();

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error fetching managed accounts: " + error?.message
    });
  }
};

export const getAccountSummary = (req, res) => {
  try {

    const ib = ibClient.getIB();

    const reqId = ibClient.getNextRequestId();

    const result = {};

    const tags = [
      "NetLiquidation",
      "TotalCashValue",
      "BuyingPower",
      "AvailableFunds",
      "ExcessLiquidity"
    ].join(",");

    const summaryHandler = (
      requestId,
      account,
      tag,
      value,
      currency
    ) => {

      if (requestId !== reqId) return;

      result[tag] = {
        value,
        currency
      };
    };

    const endHandler = (requestId) => {

      if (requestId !== reqId) return;

      cleanup();

      res.status(200).json({
        success: true,
        result
      });
    };

    const cleanup = () => {
      ib.removeListener(
        "accountSummary",
        summaryHandler
      );

      ib.removeListener(
        "accountSummaryEnd",
        endHandler
      );
    };

    ib.on(
      "accountSummary",
      summaryHandler
    );

    ib.on(
      "accountSummaryEnd",
      endHandler
    );

    ib.reqAccountSummary(
      reqId,
      "All",
      tags
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error fetching account summary: " +
        error?.message
    });
  }
};