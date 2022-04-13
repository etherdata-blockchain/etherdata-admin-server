import ContainerTreeView from "../../../components/device/dialog/containerTreeView";
import { render, screen } from "@testing-library/react";
import { interfaces } from "@etherdata-blockchain/common";
import "@testing-library/jest-dom";

describe("Given a container tree view", () => {
  test("Should render correctly", async () => {
    const containerInfo: interfaces.db.ContainerInfoWithLog = {
      Id: "mock_id",
      Names: [],
      Image: "mock_image",
      ImageID: "mock_image_id",
      Command: "mock_command",
      Created: 0,
      Ports: [],
      Labels: {},
      State: "Running",
      Status: "Running",
      HostConfig: {
        NetworkMode: "",
      },
      NetworkSettings: {
        Networks: {},
      },
      Mounts: [],
      logs: "mock logs",
    };

    render(<ContainerTreeView containers={[containerInfo, containerInfo]} />);

    expect(screen.getByTestId("container-0")).toBeInTheDocument();
    expect(screen.getByTestId("container-1")).toBeInTheDocument();
  });
});
