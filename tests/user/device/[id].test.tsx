import DetailPage from "../../../pages/user/devices/detail/[id]";
import { render, screen } from "@testing-library/react";
import { schema } from "@etherdata-blockchain/storage-model";
import UIProviderProvider from "../../../model/UIProvider";
import DeviceProvider from "../../../model/DeviceProvider";
import { beforeUITest } from "../../utils/ui-test";

const testData: schema.IDevice = {
  _id: "mock_id",
  id: "mock_qr",
  lastSeen: new Date(),
  name: "mock_name",
  adminVersion: "1.12.5",
  docker: {
    images: [
      {
        Containers: -1,
        Created: 1648619297,
        Id: "mock_id",
        Labels: {},
        ParentId: "",
        RepoDigests: [],
        RepoTags: ["mock_repo"],
        SharedSize: -1,
        Size: 117191232,
        VirtualSize: 117191232,
      },
    ],
    containers: [
      {
        Id: "mock",
        Names: ["/name"],
        Image: "mock_image",
        ImageID: "sha256:id",
        Command: "docker-entrypoint.sh node dist/index.js",
        Created: 1649755141,
        Ports: [],
        Labels: {},
        State: "running",
        Status: "Up 10 hours",
        HostConfig: {
          NetworkMode: "host",
        },
        NetworkSettings: {
          Networks: {
            host: {
              IPAMConfig: null,
              Links: null,
              Aliases: null,
              NetworkID: "",
              EndpointID: "",
              Gateway: "",
              IPAddress: "",
              IPPrefixLen: 0,
              IPv6Gateway: "",
              GlobalIPv6Address: "",
              GlobalIPv6PrefixLen: 0,
              MacAddress: "",
            },
          },
        },
        Mounts: [
          {
            Type: "bind",
            Source: "/mnt/scripts_admin/stack.lock.yaml",
            Destination: "/app/stack.lock.yaml",
            Mode: "rw",
            RW: true,
            Propagation: "rprivate",
          },
        ],
      },
    ],
    volumes: [
      {
        Driver: "local",
        Labels: {},
        Mountpoint:
          "/var/lib/docker/volumes/0bbd1291559d60d278cf9963c977145d396906157b40b89a128c5717f3381311/_data",
        Name: "0bbd1291559d60d278cf9963c977145d396906157b40b89a128c5717f3381311",
        Options: null,
        Scope: "local",
      },
    ],
  },
  data: {
    difficulty: 100,
    extraData: "0x0",
    gasLimit: 8000000,
    gasUsed: 0,
    hash: "0x1",
    logsBloom: "0x1",
    miner: "0x1",
    mixHash: "0x1",
    nonce: "0x1",
    number: 2000000,
    parentHash: "0x1",
    receiptsRoot: "0x1",
    sha3Uncles: "0x1",
    size: 540,
    stateRoot: "0x1",
    timestamp: 1648985700,
    totalDifficulty: 100,
    transactions: [],
    transactionsRoot: "0x1",
    uncles: [],
    balance: "123445",
    systemInfo: {
      name: "mock_qr_code",
      peerCount: 1,
      isMining: false,
      //@ts-ignore
      isSyncing: {
        currentBlock: 2000000,
        highestBlock: 2037352,
        knownStates: 0,
        pulledStates: 0,
        startingBlock: 2000000,
      },
      coinbase: "mock_coinbase",
      nodeVersion: "mock",
      hashRate: 0,
      nodeId: "mock_qr_code",
    },
    blockTime: 13,
    avgBlockTime: 12.06,
    peers: [],
  },
};

//@ts-ignore
const device: schema.IStorageItem = {
  deviceStatus: testData,
  name: "",
  description: "",
  price: 0,
  column: 0,
  row: 0,
  qr_code: "test_device_1",
  created_time: new Date(),
  machine_type_name: null,
  location_name: null,
  position_name: null,
  owner_id: "",
  images: [],
  uuid: "",
  images_objects: [],
};

describe("Given a device id page", () => {
  beforeAll(() => {
    beforeUITest();
  });

  test("Should render without error", () => {
    render(
      <UIProviderProvider>
        <DeviceProvider>
          <DetailPage
            device={device}
            online={true}
            found={true}
            tabIndex={0}
            deviceId={"abc"}
          />
        </DeviceProvider>
      </UIProviderProvider>
    );
    expect(screen.getByText("2000000")).toBeInTheDocument();
  });

  test("Should render without error 1", () => {
    render(
      <UIProviderProvider>
        <DeviceProvider>
          <DetailPage
            device={device}
            online={true}
            found={true}
            tabIndex={1}
            deviceId={"test_device_1"}
          />
        </DeviceProvider>
      </UIProviderProvider>
    );
    screen.debug(undefined, 10000000);
    expect(screen.getByText("Update User Info")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test_device_1")).toBeInTheDocument();
  });
});
