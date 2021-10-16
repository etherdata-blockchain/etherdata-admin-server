import next from "next";
import express from "express";
import { Server } from "./server";
import mongoose from "mongoose";
import Logger from "./logger";
import { ClientPlugin } from "./plugin/plugins/socketIOPlugins/clientPlugin";
import { createServer } from "http";
import { AppPlugin } from "./plugin/plugins/socketIOPlugins/appPlugin";
import { DBChangePlugin } from "./plugin/plugins/socketIOPlugins/dbPlugin";
import { MongoClient } from "mongodb";

const port = parseInt(process.env.PORT!, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const client = new MongoClient(process.env.MONGODB_URL!);
  await client.connect();
  //@ts-ignore
  global.MONGO_CLIENT = client;

  const server = express();
  const httpServer = createServer(server);
  const plugins: any[] = [
    new ClientPlugin(),
    new AppPlugin(),
    new DBChangePlugin(),
  ];
  const socketIOServer = new Server(plugins);

  //@ts-ignore
  global.nodePlugin = plugins[0];

  mongoose.set("useNewUrlParser", true);
  mongoose.set("useUnifiedTopology", true);
  mongoose.set(`useFindAndModify`, true);

  await mongoose.connect(process.env.MONGODB_URL!);
  Logger.info("Connected to database");

  await socketIOServer.start(httpServer);

  server.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
