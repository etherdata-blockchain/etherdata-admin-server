import { Configurations } from "../../internal/const/configurations";
import { Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { StorageManagementSystemPlugin } from "../../internal/services/dbServices/storage-management-system-plugin";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

let dbServer: MongoMemoryServer;
let db: Db;
let mongoClient: MongoClient;

beforeAll(async () => {
  dbServer = await MongoMemoryServer.create();
});

beforeEach(async () => {
  mongoClient = new MongoClient(dbServer.getUri());
  await mongoClient.connect();
  db = mongoClient.db(Configurations.storageDBName);
});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(() => {
  dbServer.stop();
});

test("Get storage item count", async () => {
  const plugin = new StorageManagementSystemPlugin(mongoClient);
  const itemCol = db.collection(Configurations.storageItemCollectionName);
  await itemCol.insertMany([
    {
      name: "test",
      qr_code: "1",
    },
    {
      name: "test1",
      qr_code: "2",
    },
    {
      name: "test2",
      qr_code: "3",
    },
  ]);

  expect(await plugin.countItems()).toBe(3);
});

test("Find device by id", async () => {
  const plugin = new StorageManagementSystemPlugin(mongoClient);
  const itemCol = db.collection(Configurations.storageItemCollectionName);
  await itemCol.insertMany([
    {
      name: "test",
      qr_code: "1",
    },
    {
      name: "test1",
      qr_code: "2",
    },
    {
      name: "test2",
      qr_code: "3",
    },
  ]);

  expect((await plugin.findDeviceById("3"))!.qr_code).toBe("3");
});

test("Find devices by user", async () => {
  const plugin = new StorageManagementSystemPlugin(mongoClient);
  const itemCol = db.collection(Configurations.storageItemCollectionName);
  await itemCol.insertMany([
    {
      name: "test",
      qr_code: "1",
      owner_id: 1,
    },
    {
      name: "test1",
      qr_code: "2",
      owner_id: 1,
    },
    {
      name: "test2",
      qr_code: "3",
      owner_id: undefined,
    },
  ]);
  Configurations.numberPerPage = 1;
  const result = await plugin.getDevicesByUser(0, "1");
  expect(result.totalPage).toBe(2);
  expect(result.storageDevices.length).toBe(1);
});

test("Find devices by user without user id", async () => {
  const plugin = new StorageManagementSystemPlugin(mongoClient);
  const itemCol = db.collection(Configurations.storageItemCollectionName);
  await itemCol.insertMany([
    {
      name: "test",
      qr_code: "1",
      owner_id: 1,
    },
    {
      name: "test1",
      qr_code: "2",
      owner_id: 1,
    },
    {
      name: "test2",
      qr_code: "3",
      owner_id: undefined,
    },
  ]);
  Configurations.numberPerPage = 1;
  const result = await plugin.getDevicesByUser(0, undefined);
  expect(result.totalPage).toBe(1);
  expect(result.storageDevices.length).toBe(1);
});

test("Get users", async () => {
  const plugin = new StorageManagementSystemPlugin(mongoClient);
  const itemCol = db.collection(Configurations.storageUserCollectionName);
  await itemCol.insertMany([
    {
      id: "1",
      user_name: "1",
      user_id: "1",
    },
    {
      id: "2",
      user_name: "2",
      user_id: "2",
    },
    {
      id: "3",
      user_name: "3",
      user_id: "3",
    },
  ]);
  Configurations.numberPerPage = 1;
  const result = await plugin.getUsers(0);
  expect(result.totalPage).toBe(4);
  expect(result.users.length).toBe(2);
});
