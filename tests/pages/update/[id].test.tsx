import React from "react";
import { schema } from "@etherdata-blockchain/storage-model";
import { interfaces, mockData, utils } from "@etherdata-blockchain/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import UpdateTemplatePage, {
  getServerSideProps,
} from "../../../pages/update/template/edit/[id]";
import { dbServices } from "@etherdata-blockchain/services";
import UIProviderProvider from "../../../model/UIProvider";
import { ParsedUrlQuery } from "querystring";
import { GetServerSidePropsContext } from "next";

describe("Given a update template page with a created update template", () => {
  let mockDockerImage1: interfaces.db.DockerImageDBInterface;
  let mockDockerImage2: interfaces.db.DockerImageDBInterface;
  let mockDockerImage3: interfaces.db.DockerImageDBInterface;
  let mockDevice1: interfaces.db.StorageItemDBInterface;
  let dbServer: MongoMemoryServer;

  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create({ binary: { version: "6.0.5" } });
    await mongoose.connect(dbServer.getUri().concat("etd"));
    mockDockerImage1 = (await schema.DockerImageModel.create(
      mockData.MockDockerImage
    )) as any;
    mockDockerImage2 = (await schema.DockerImageModel.create(
      mockData.MockDockerImage2
    )) as any;
    mockDockerImage3 = (await schema.DockerImageModel.create(
      mockData.MockDockerImage3
    )) as any;
    mockDevice1 = await schema.StorageItemModel.create(
      mockData.MockStorageItem
    );
  });

  afterAll(async () => {
    await schema.DockerImageModel.collection.drop();
    await dbServer.stop();
  });

  describe("When trying to update the existing template", () => {
    let createdTemplate: interfaces.db.UpdateTemplateDBInterface;

    beforeEach(async () => {
      const mockUpdateScriptData = JSON.parse(
        JSON.stringify(mockData.MockUpdateScriptData)
      );

      const imageId = (mockDockerImage1 as any)._id;
      const tagId = (mockDockerImage1.tags[0] as any)._id;

      mockUpdateScriptData.imageStacks[0].tag = tagId;
      mockUpdateScriptData.imageStacks[0].image = imageId;

      mockUpdateScriptData.containerStacks[0].image.image = imageId;
      mockUpdateScriptData.containerStacks[0].image.tag = tagId;

      createdTemplate = await schema.UpdateScriptModel.create(
        mockUpdateScriptData
      );
    });

    test("Should create a correct updated template", async () => {
      const service = new dbServices.UpdateTemplateService();
      const template = await service.getUpdateTemplateWithDockerImage(
        (createdTemplate as any)._id
      );

      await render(
        <UIProviderProvider>
          <UpdateTemplatePage updateTemplate={template!} />
        </UIProviderProvider>
      );
      // screen.debug(undefined, 300000000000);
      const items = await screen.findAllByDisplayValue(
        `${mockDockerImage1.imageName}:${mockDockerImage1.tags[0].tag}`
      );
      const submitBtn = await screen.findByText("Submit");
      expect(items).toHaveLength(2);
      expect(submitBtn).toBeInTheDocument();
    });

    test("Should return a correct update template", async () => {
      const context = {
        query: {
          id: (createdTemplate as any)._id,
        },
      };
      const value = (await getServerSideProps(context as any)) as any;
      expect(value.props.updateTemplate).toBeDefined();
    });
  });
});
