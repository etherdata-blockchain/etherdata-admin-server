import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { NodePlugin } from "../plugin/plugins/socketIOPlugins/nodePlugin";
import { ClientPlugin } from "../plugin/plugins/socketIOPlugins/clientPlugin";
import Client from "socket.io-client";
import { Web3DataInfo } from "../client/node_data";

let data: Web3DataInfo = {
  avgBlockTime: 10,
  balance: "2",
  blockNumber: 2,
  blockTime: 10,
  difficulty: "3000",
  gasLimit: 10,
  gasUsed: 10,
  hash: "0xabd",
  miner: "0xabcde",
  nonce: "1",
  peers: [],
  systemInfo: {
    coinbase: "abcde",
    hashRate: 20,
    isMining: false,
    isSyncing: false,
    name: "",
    nodeVersion: "",
    peerCount: 0,
  },
  timestamp: 1,
};

function deepCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

function sleep(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("");
    }, time);
  });
}

describe("Node Plugin Test", () => {
  let httpServer: any;
  let clientPlugin: ClientPlugin;
  let nodePlugin: NodePlugin;
  let browserClient: Socket;
  let nodeClient: Socket;
  let socket: Server;
  const port = 3000;

  beforeEach((done) => {
    httpServer = createServer();
    socket = new Server(httpServer, { cors: { origin: "*" } });
    nodePlugin = new NodePlugin();
    clientPlugin = new ClientPlugin();

    socket.listen(port);

    clientPlugin.connectPlugins([nodePlugin]);
    nodePlugin.connectPlugins([clientPlugin]);

    clientPlugin.startSocketIOServer(socket);
    nodePlugin.startSocketIOServer(socket);

    browserClient = Client(
      `http://localhost:${port}/clients`
    ) as unknown as Socket;

    nodeClient = Client(`http://localhost:${port}/nodes`) as unknown as Socket;

    nodePlugin.server?.on("connect", () => {
      done();
    });
  });

  afterEach(async () => {
    socket.close();
    //@ts-ignore
    nodeClient.close();
  });

  test("Send realtime data", (done) => {
    nodeClient.emit("node-info", data);
    browserClient.on("realtime-info", (data) => {
      expect(data).toBeDefined();
      done();
    });
  });

  test("Send realtime data 2", (done) => {
    nodeClient.emit("node-info", data);

    sleep(200).then(() => {
      nodeClient.emit("node-info", data);
      browserClient.on("realtime-info", (data) => {
        expect(data).toBeDefined();
        done();
      });
    });
  });
});
