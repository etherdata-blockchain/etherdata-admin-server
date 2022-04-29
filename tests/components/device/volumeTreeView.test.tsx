import { fireEvent, render, screen } from "@testing-library/react";
import VolumeTreeView from "../../../components/device/dialog/volumeTreeView";
import { VolumeInspectInfo } from "dockerode";

const volume: VolumeInspectInfo = {
  Driver: "local",
  Labels: {},
  Mountpoint: "mock_location",
  Name: "mock volume",
  Options: {},
  Scope: "local",
};

const volume2: VolumeInspectInfo = {
  Driver: "local",
  Labels: {},
  Mountpoint: "mock_location_2",
  Name: "mock volume 2",
  Options: {},
  Scope: "local",
};

describe("Given a volume tree view", () => {
  test("Should render correctly", async () => {
    render(<VolumeTreeView volumes={[volume, volume2]} />);
    expect(screen.getByText("mock volume")).toBeInTheDocument();
    expect(screen.getByText("mock volume 2")).toBeInTheDocument();
  });

  test("Should render correctly", async () => {
    render(<VolumeTreeView volumes={[]} />);
    expect(screen.queryByText("mock volume")).not.toBeInTheDocument();
    expect(screen.queryByText("mock volume 2")).not.toBeInTheDocument();
  });
});

describe("Given a volume detail item", () => {
  test("Should render correctly", async () => {
    render(<VolumeTreeView volumes={[volume]} />);
    fireEvent.click(screen.getByText(volume.Name));

    expect(screen.queryAllByText(volume.Name)).toHaveLength(2);
    expect(screen.getByText(volume.Mountpoint)).toBeInTheDocument();

    fireEvent.contextMenu(screen.queryAllByText(volume.Name)[0]);
    expect(screen.getByText("Delete volume")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete volume"));
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });
});
