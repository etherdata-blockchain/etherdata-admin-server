import { fireEvent, render, screen } from "@testing-library/react";
import { UserInfoPanel } from "../../../components/common/panels/UserInfoPanel";
import UserInfoProvider, {
  UserInfoContext,
} from "../../../model/UserInfoProvider";

describe("Given a user info panel", () => {
  const close = jest.fn();
  const submit = jest.fn();

  afterEach(() => {
    close.mockClear();
    submit.mockClear();
  });

  test("Should render properly", async () => {
    render(<UserInfoPanel onClose={close} onSubmit={submit} />);

    expect(screen.getByText("user_id")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.queryAllByText("coinbase")).toHaveLength(2);
  });

  test("Should render properly", async () => {
    render(
      <UserInfoPanel
        onClose={close}
        onSubmit={submit}
        userInfo={{
          user_name: "mock_user",
          user_id: "mock_id",
          coinbase: "0xabcde",
        }}
      />
    );

    expect(screen.getByText("user_id")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.queryAllByText("coinbase")).toHaveLength(2);
    expect(screen.getByDisplayValue("mock_user")).toBeInTheDocument();
    expect(screen.getByDisplayValue("mock_id")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0xabcde")).toBeInTheDocument();
  });

  test("Should submit correctly", async () => {
    render(
      <UserInfoProvider>
        <div>
          <UserInfoPanel
            onClose={close}
            onSubmit={submit}
            userInfo={{
              user_name: "mock_user",
              user_id: "mock_id",
              coinbase: "0xabcde",
            }}
          />
          <UserInfoContext.Consumer>
            {({ submit }) => <button onClick={submit}>Submit</button>}
          </UserInfoContext.Consumer>
        </div>
      </UserInfoProvider>
    );

    expect(screen.getByText("user_id")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.queryAllByText("coinbase")).toHaveLength(2);

    expect(screen.getByDisplayValue("mock_user")).toBeInTheDocument();
    expect(screen.getByDisplayValue("mock_id")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0xabcde")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("0xabcde"), {
      target: { value: "0x12345" },
    });

    expect(screen.getByDisplayValue("0x12345")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Submit"));
    expect(submit).toBeCalledWith({
      user_id: "mock_id",
      user_name: "mock_user",
      coinbase: "0x12345",
    });
  });
});
