import { BareMuxConnection } from "@mercuryworkshop/bare-mux";

type transportConfig = {
  wisp: string;
};
export default class TransportManager {
  private transport: Alu.Key;
  connection: BareMuxConnection;

  constructor(transport?: Alu.Key) {
    this.connection = new BareMuxConnection("/baremux/worker.js");
    if (transport) {
      this.transport = transport;
    }
    this.transport = Alu.store.get("transport");
  }
  async updateTransport() {
    try {
      const selectedTransport = Alu.store.get("transport");
      await this.setTransport(selectedTransport);
    } catch {
      throw new Error("Failed to update transport! Try reloading.");
    }
  }

  getTransport() {
    return this.transport;
  }

  async setTransport(transport: Alu.Key, wispURL: string = Alu.store.get("wisp").value) {
    this.transport = transport;
    const transportConfig: transportConfig = { wisp: wispURL };

    if (this.transport.value == "/baremod/index.mjs") {
      return await this.connection.setTransport(transport.value, [Alu.store.get("bareUrl").value]);
    }

    await this.connection.setTransport(transport.value, [transportConfig]);
  }
}

export const TransportMgr = new TransportManager();

export async function initTransport() {
  await TransportMgr.setTransport(TransportMgr.getTransport(), Alu.store.get("wisp").value);
}

export async function registerAndUpdateSW(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    });
    console.log("Service worker registered!");
    await reg.update();
  } catch (err) {
    console.error("Service worker registration failed: ", err);
  }
}
