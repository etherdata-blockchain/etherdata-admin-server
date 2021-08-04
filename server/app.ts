import { Config, ETDServer } from ".";
import { parse } from "url";
import next from "next";
import http from "http";
import express from "express";

const app = express();
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const server = http.createServer(app);
  const config = Config.fromEnvironment();
  const etd = new ETDServer({ config: config });
  await etd.startServer(server);

  app.all("*", (req, res) => {
    return nextHandler(req, res);
  });
});
