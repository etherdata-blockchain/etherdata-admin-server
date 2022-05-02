import { fireEvent, render, screen } from "@testing-library/react";
import { UpdateUserInfoPanel } from "../../../components/user/panels/UpdateUserInfoPanel";
import { beforeUITest } from "../../utils/ui-test";

describe("Given an update user info", () => {
  beforeAll(() => {
    beforeUITest();
  });

  test("Should render properly", async () => {
    render(
      <UpdateUserInfoPanel
        userInfo={{
          user_id: "mock_id",
          user_name: "mock_user",
          coinbase: "0xabcde",
        }}
      />
    );

    expect(screen.getByText("user_id")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.queryAllByText("coinbase")).toHaveLength(2);

    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText("Confirmation on deletion")).toBeInTheDocument();
  });
});
