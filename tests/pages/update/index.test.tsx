import { beforeUITest } from "../../utils/ui-test";
import { render } from "@testing-library/react";
import UpdateTemplatePanel from "../../../components/update/UpdateTemplatePanel";
import { getServerSideProps } from "../../../pages/update";
import React from "react";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("Given a Update template component", () => {
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    beforeUITest();
    dbServer = await MongoMemoryServer.create();
    await mongoose.connect(dbServer.getUri().concat("etd"));
  });

  afterAll(async () => {
    await dbServer.stop();
  });

  test("When calling getServerSideProps", async () => {
    const context = {
      params: {},
      query: {
        index: 1,
      },
    };
    const props = await getServerSideProps(context as any);
    expect(props).toBeDefined();
  });

  test("When calling render index page with a list of templates", async () => {
    const templates: any[] = [
      {
        name: "testing",
        from: "admin",
        targetDeviceIds: [],
        containerStacks: [],
      },
    ];
    const screen = await render(
      <UpdateTemplatePanel updateTemplates={templates} />
    );

    expect(await screen.findByText("testing")).toBeInTheDocument();
  });
});
