import { fireEvent, render, screen } from "@testing-library/react";
import moment from "moment";
import { ContainerInfoWithLog } from "@etherdata-blockchain/common/dist/interfaces/db-interfaces";
import ContainerTreeView from "../../../components/device/dialog/containerTreeView";

const now = moment("2022-04-01");

const container: ContainerInfoWithLog = {
  Command: "",
  Created: now.valueOf() / 1000,
  HostConfig: { NetworkMode: "" },
  Id: "mock_container_id",
  Image: "",
  ImageID: "",
  Labels: {},
  //@ts-ignore
  Mounts: undefined,
  Names: ["mock_container_1"],
  NetworkSettings: { Networks: {} },
  Ports: [],
  State: "stopped",
  Status: "",
};

const container2: ContainerInfoWithLog = {
  Command: "",
  Created: now.valueOf() / 1000,
  HostConfig: { NetworkMode: "" },
  Id: "mock_container_id_2",
  Image: "",
  ImageID: "",
  Labels: {},
  //@ts-ignore
  Mounts: undefined,
  Names: ["mock_container_2"],
  NetworkSettings: { Networks: {} },
  Ports: [],
  State: "stopped",
  Status: "",
};

describe("Given a container tree view", () => {
  test("Should render correctly", async () => {
    render(<ContainerTreeView containers={[container, container2]} />);
    expect(screen.getByText(container.Names!.toString())).toBeInTheDocument();
    expect(screen.getByText(container2.Names!.toString())).toBeInTheDocument();
  });

  test("Should render correctly", async () => {
    render(<ContainerTreeView containers={[]} />);
    expect(
      screen.queryByText(container.Names!.toString())
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(container2.Names!.toString())
    ).not.toBeInTheDocument();
  });
});

describe("Given a container detail item", () => {
  test("Should render correctly", async () => {
    render(<ContainerTreeView containers={[container]} />);
    fireEvent.click(screen.getByText(container.Names!.toString()));

    expect(screen.queryAllByText(container.Names!.toString())).toHaveLength(1);
    expect(
      screen.getByText(now.format("YYYY-MM-DD hh:mm:ss"))
    ).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText(container.Names!.toString()));
    expect(screen.getByText("Delete container")).toBeInTheDocument();
    expect(screen.getByText("Stop container")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete container"));
    expect(screen.getByText("Confirmation on deletion")).toBeInTheDocument();
  });

  test("Should render correctly", async () => {
    render(<ContainerTreeView containers={[container]} />);
    fireEvent.click(screen.getByText(container.Names!.toString()));
    fireEvent.contextMenu(screen.getByText(container.Names!.toString()));
    fireEvent.click(screen.getByText("Stop container"));
    expect(screen.getByText("Confirmation on stop")).toBeInTheDocument();
  });
});
