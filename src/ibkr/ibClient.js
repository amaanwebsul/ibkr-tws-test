import IB from "ib";

class IBClient {

  constructor() {

    this.ib = null;

    this.connected =
      false;

    this.nextOrderId =
      null;

    // Informational messages
    this.infoCodes = [
      2104, // Market data farm OK
      2106, // HMDS OK
      2158, // Sec-def OK
      2108, // HMDS inactive
    ];

    // Warning messages
    this.warningCodes = [
      2109, // TIF auto set
      10167, // Delayed market data
      10089, // Delayed market data available
      399, // Order warnings (market closed, queued order, presets)
    ];
  }

  init() {

    this.ib = new IB({
      host:
        process.env.IB_HOST,

      port:
        Number(
          process.env.IB_PORT
        ),

      clientId:
        Number(
          process.env.IB_CLIENT_ID
        ),
    });

    this.setupEvents();
  }

  setupEvents() {

    // Connected
    this.ib.on(
      "connected",
      () => {

        console.log(
          "✅ IB Connected"
        );

        this.connected =
          true;

        // Ask IBKR
        // for next valid order id
        this.ib.reqIds(1);

        // Ask gateway time
        this.ib.reqCurrentTime();
      }
    );

    // Disconnected
    this.ib.on(
      "disconnected",
      () => {

        console.log(
          "❌ IB Disconnected"
        );

        this.connected =
          false;
      }
    );

    // Next valid order id
    this.ib.on(
      "nextValidId",
      (
        orderId
      ) => {

        console.log(
          `📌 Next Order ID: ${orderId}`
        );

        this.nextOrderId =
          orderId;
      }
    );

    // Gateway time
    this.ib.on(
      "currentTime",
      (
        time
      ) => {

        console.log(
          "🕒 Gateway Time:",
          new Date(
            time * 1000
          ).toISOString()
        );
      }
    );

    // Error / Warning / Info handling
    this.ib.on(
      "error",
      (
        err,
        code,
        reqId
      ) => {

        const ibCode =
          code?.code ??
          code;

        const message =
          err?.message ||
          err;

        // Info messages
        if (
          this.infoCodes.includes(
            ibCode
          )
        ) {

          console.log(
            `ℹ️ ${message}`
          );

          return;
        }

        // Warning messages
        if (
          this.warningCodes.includes(
            ibCode
          )
        ) {

          console.warn(
            `⚠️ ${message}`
          );

          return;
        }

        // Real errors
        console.error(
          "❌ IB Error",
          {
            message,
            code:
              ibCode,
            reqId,
          }
        );
      }
    );
  }

  connect() {

    if (
      !this.ib
    ) {

      this.init();
    }

    if (
      !this.connected
    ) {

      console.log(
        "Connecting to IB..."
      );

      this.ib.connect();
    }
  }

  getIB() {

    if (
      !this.ib
    ) {

      throw new Error(
        "IB Client not initialized"
      );
    }

    return this.ib;
  }

  getNextOrderId() {

    if (
      this.nextOrderId
      === null
    ) {

      throw new Error(
        "Order ID not initialized yet"
      );
    }

    return this
      .nextOrderId++;
  }
}

export default
  new IBClient();