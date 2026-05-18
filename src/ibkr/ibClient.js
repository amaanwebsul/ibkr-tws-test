import IB from "ib";

class IBClient {
  constructor() {
    this.ib = null;
    this.connected = false;

    this.requestId = 1;

    this.statusCodes = [
      2104, // market data farm ok
      2106, // HMDS farm ok
      2158, // sec-def farm ok
      2107,
      2108,
    ];
  }

  init() {
    this.ib = new IB({
      host: process.env.IB_HOST,
      port: Number(process.env.IB_PORT),
      clientId: Number(
        process.env.IB_CLIENT_ID
      ),
    });

    this.setupEvents();
  }

  getNextRequestId() {
    return this.requestId++;
  }

  setupEvents() {

    this.ib.on(
      "connected",
      () => {
        console.log(
          "✅ IB Connected"
        );

        this.connected = true;

        // optional:
        this.requestCurrentTime();
      }
    );

    this.ib.on(
      "disconnected",
      () => {
        console.log(
          "❌ IB Disconnected"
        );

        this.connected = false;
      }
    );

    this.ib.on(
      "error",
      (
        err,
        code,
        reqId
      ) => {

        const ibCode =
          code?.code;

        // Ignore informational status messages
        if (
          this.statusCodes.includes(
            ibCode
          )
        ) {
          console.log(
            `ℹ️ ${err.message}`
          );
          return;
        }

        console.error(
          "❌ IB Error",
          {
            message:
              err?.message,
            code:
              ibCode,
            reqId,
          }
        );
      }
    );

    // Helpful heartbeat
    this.ib.on(
      "currentTime",
      (time) => {
        console.log(
          "🕒 Gateway Time:",
          new Date(
            time * 1000
          )
        );
      }
    );
  }

  connect() {

    if (!this.ib) {
      this.init();
    }

    if (!this.connected) {
      console.log(
        "Connecting to IB..."
      );

      this.ib.connect();
    }
  }

  disconnect() {

    if (
      this.ib &&
      this.connected
    ) {
      this.ib.disconnect();
    }
  }

  requestCurrentTime() {

    if (
      this.ib &&
      this.connected
    ) {
      this.ib.reqCurrentTime();
    }
  }

  isConnected() {
    return this.connected;
  }

  getIB() {
    return this.ib;
  }
}

export default new IBClient();