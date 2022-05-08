import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RunDialog } from "../../../components/update/RunDialog";
import axios from "axios";

jest.mock("axios");

describe("Given a run dialog", () => {
  beforeAll(() => {
    process.env = {
      ...process.env,
      NEXT_PUBLIC_SECRET: "test",
    };
  });

  test("Should render properly", () => {
    render(
      <RunDialog
        defaultTargetGroupIds={[]}
        defaultTargetDeviceIds={[]}
        onClose={() => {}}
        open={true}
        templateId={"mock_id"}
      />
    );
    expect(screen.getByText("Run Update Template")).toBeInTheDocument();
  });

  test("Should render properly", () => {
    render(
      <RunDialog
        defaultTargetGroupIds={["mock_user"]}
        defaultTargetDeviceIds={["mock_id"]}
        onClose={() => {}}
        open={true}
        templateId={"mock_id"}
      />
    );
    expect(screen.getByText("Run Update Template")).toBeInTheDocument();
    expect(screen.getByText("mock_id")).toBeInTheDocument();
    expect(screen.getByText("mock_user")).toBeInTheDocument();
  });

  test("Should work properly", async () => {
    const mockPost = jest.fn().mockResolvedValue({});
    (axios.create as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    const onClose = jest.fn();
    render(
      <RunDialog
        defaultTargetGroupIds={["mock_user", "mock_user_2"]}
        defaultTargetDeviceIds={["mock_id", "mock_id_2"]}
        onClose={onClose}
        open={true}
        templateId={"mock_id"}
      />
    );

    const clearBtns = screen.getAllByTitle("Clear");

    fireEvent.click(clearBtns[0]);
    fireEvent.click(clearBtns[1]);
    fireEvent.click(screen.getByText("Run"));
    await waitFor(() => expect(screen.getByText("Run")).toBeInTheDocument());

    expect(mockPost).toBeCalledTimes(1);
    expect(mockPost).toBeCalledWith("/api/v1/update-template/run/mock_id", {
      targetDeviceIds: [],
      targetGroupIds: [],
    });
  });

  test("Should work properly", async () => {
    const mockPost = jest.fn().mockResolvedValue({});
    (axios.create as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    const onClose = jest.fn();
    render(
      <RunDialog
        defaultTargetGroupIds={["mock_user", "mock_user_2"]}
        defaultTargetDeviceIds={["mock_id", "mock_id_2"]}
        onClose={onClose}
        open={true}
        templateId={"mock_id"}
      />
    );

    fireEvent.click(screen.getByText("Run"));
    await waitFor(() => expect(screen.getByText("Run")).toBeInTheDocument());

    expect(mockPost).toBeCalledTimes(1);
    expect(mockPost).toBeCalledWith("/api/v1/update-template/run/mock_id", {
      targetDeviceIds: ["mock_id", "mock_id_2"],
      targetGroupIds: ["mock_user", "mock_user_2"],
    });
  });
});
