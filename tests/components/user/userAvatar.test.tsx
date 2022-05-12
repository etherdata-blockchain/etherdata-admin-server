import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UserAvatar } from "../../../components/user/userAvatar";
import "@testing-library/jest-dom";

jest.mock("axios", () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({
      data: { ids: ["mock_id_1", "mock_id_2"] },
    }),
    post: jest.fn(),
  }),
}));

describe("Given a userAvatar", () => {
  beforeAll(async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: "test",
      NEXT_PUBLIC_SECRET: "test",
    };
  });

  test("Should render properly", async () => {
    render(
      <UserAvatar
        username={"mock_username"}
        userId={"abc"}
        coinbase={"0xmock_coinbase"}
      />
    );
    expect(screen.getByText("mock_username")).toBeInTheDocument();
    expect(screen.getByText("0xmock_coinbase")).toBeInTheDocument();
    expect(screen.queryByText("Actions")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Actions"));
    fireEvent.click(screen.getByText("Register Devices"));

    expect(screen.getByText("Register devices with user")).toBeInTheDocument();
    // screen.debug(undefined, 60000);
    await waitFor(() =>
      expect(screen.getByText("mock_id_1")).toBeInTheDocument()
    );
    expect(screen.getByText("mock_id_2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("OK"));
    await waitFor(() =>
      expect(
        screen.queryByText("Register devices with user")
      ).not.toBeInTheDocument()
    );
  });

  test("Should render properly", async () => {
    render(
      <UserAvatar
        username={"mock_username"}
        userId={"abc"}
        coinbase={"0xmock_coinbase"}
      />
    );
    expect(screen.getByText("mock_username")).toBeInTheDocument();
    expect(screen.getByText("0xmock_coinbase")).toBeInTheDocument();
    expect(screen.queryByText("Actions")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Actions"));
    fireEvent.click(screen.getByText("Add Device"));

    expect(screen.getByText("Create a new device")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Close")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Close"));
    await waitFor(() =>
      expect(screen.queryByText("Create a new device")).not.toBeInTheDocument()
    );
  });

  test("Should render properly", () => {
    render(
      <UserAvatar username={"mock_username"} userId={"abc"} coinbase={""} />
    );
    expect(screen.getByText("mock_username")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  test("Should render properly", () => {
    render(
      <UserAvatar
        username={undefined}
        userId={undefined}
        coinbase={undefined}
      />
    );
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
  });
});
