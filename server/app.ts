import next from "next";
import express from "express";
import { Server } from "./server";
import mongoose from "mongoose";
import { createServer } from "http";
import { configs } from "@etherdata-blockchain/common";
import { socketServices } from "@etherdata-blockchain/services";
import Logger from "@etherdata-blockchain/logger";

const port = parseInt(process.env.PORT!, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const server = express();
  const httpServer = createServer(server);
  const plugins: any[] = [
    new socketServices.ClientService(),
    new socketServices.APpService(),
    new socketServices.DBChangePlugin(),
  ];
  const socketIOServer = new Server(plugins);

  // @ts-ignore
  global.nodePlugin = plugins[0];

  await mongoose.connect(
    configs.Environments.ServerSideEnvironments.MONGODB_URL,
    {
      dbName: "etd",
    }
  );
  Logger.info("Connected to database");

  await socketIOServer.start(httpServer);

  server.all("*", (req, res) => {
    return nextHandler(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
