import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeUITest } from "../../utils/ui-test";
import { AddUserBtn } from "../../../components/user/addUserBtn";

describe("Given a add user button", () => {
  beforeAll(() => {
    beforeUITest();
  });

  test("Should render properly", async () => {
    render(<AddUserBtn />);

    fireEvent.click(screen.getByText("Add User"));

    expect(screen.getByText("Add New User")).toBeInTheDocument();
    expect(screen.getByText("user_id")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.queryAllByText("coinbase")).toHaveLength(2);

    fireEvent.click(screen.getByText("Close"));
    await waitFor(() =>
      expect(screen.queryByText("Add New User")).not.toBeInTheDocument()
    );
  });
});
