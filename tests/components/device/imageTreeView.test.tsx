import { fireEvent, render, screen } from "@testing-library/react";
import { ImageInfo } from "dockerode";
import moment from "moment";
import ImageTreeView from "../../../components/device/dialog/imageTreeView";

const now = moment("2022-04-01");

const image: ImageInfo = {
  Containers: 0,
  Created: now.valueOf() / 1000,
  Id: "Image_1",
  Labels: {},
  ParentId: "",
  RepoTags: ["mock_0"],
  SharedSize: 0,
  Size: 2048,
  VirtualSize: 0,
};

const image2: ImageInfo = {
  Containers: 0,
  Created: now.valueOf() / 1000,
  Id: "Image_2",
  Labels: {},
  ParentId: "",
  RepoTags: ["mock_1"],
  SharedSize: 0,
  Size: 2048,
  VirtualSize: 0,
};

describe("Given an image tree view", () => {
  test("Should render correctly", async () => {
    render(<ImageTreeView images={[image, image2]} />);
    expect(screen.getByText(image.RepoTags!.toString())).toBeInTheDocument();
    expect(screen.getByText(image2.RepoTags!.toString())).toBeInTheDocument();
  });

  test("Should render correctly", async () => {
    render(<ImageTreeView images={[]} />);
    expect(
      screen.queryByText(image.RepoTags!.toString())
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(image2.RepoTags!.toString())
    ).not.toBeInTheDocument();
  });
});

describe("Given a image detail item", () => {
  test("Should render correctly", async () => {
    render(<ImageTreeView images={[image]} />);
    fireEvent.click(screen.getByText(image.RepoTags!.toString()));

    expect(screen.queryAllByText(image.RepoTags!.toString())).toHaveLength(1);
    expect(screen.getByText("2.00 KB")).toBeInTheDocument();
    expect(
      screen.getByText(now.format("YYYY-MM-DD hh:mm:ss"))
    ).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText(image.RepoTags!.toString()));
    expect(screen.getByText("Delete image")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete image"));
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });
});
