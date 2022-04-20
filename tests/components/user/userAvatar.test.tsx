import { render, screen } from "@testing-library/react";
import { UserAvatar } from "../../../components/user/userAvatar";
import "@testing-library/jest-dom";

describe("Given a userAvatar", () => {
  test("Should render properly", () => {
    render(
      <UserAvatar
        username={"mock_username"}
        userId={"abc"}
        coinbase={"0xmock_coinbase"}
      />
    );
    expect(screen.getByText("mock_username")).toBeInTheDocument();
    expect(screen.getByText("0xmock_coinbase")).toBeInTheDocument();
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
  });
});
