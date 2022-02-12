import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { initApp } from "../server/server";

describe("Given a app", () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    process.env = {
      ...process.env,
      MONGODB_URL: dbServer.getUri(),
    };
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("Start app", async () => {
    const { httpServer, server } = await initApp();
    expect(httpServer).toBeDefined();
    expect(server).toBeDefined();
  });
});
