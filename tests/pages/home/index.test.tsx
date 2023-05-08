import { MongoMemoryServer } from "mongodb-memory-server";
import { getServerSideProps } from "../../../pages/home";
import { GetServerSidePropsContext } from "next";
import { mockData } from "@etherdata-blockchain/common";
import mongoose from "mongoose";

describe("Given a home page", () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
    dbServer = await MongoMemoryServer.create({ binary: { version: "6.0.5" } });
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterEach(async () => {
    try {
    } catch (err) {}
  });

  afterAll(() => {
    dbServer.stop();
  });

  test("When calling getServerSideProps", async () => {
    const context = {
      params: {},
    };
    const props = await getServerSideProps(
      context as GetServerSidePropsContext
    );
    expect(props).toBeDefined();
  });
});
