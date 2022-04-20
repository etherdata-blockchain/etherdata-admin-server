import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RunDialog } from "../../../components/update/RunDialog";

describe("Given a run dialog", () => {
  test("Should render properly", () => {
    render(
      <RunDialog
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
        defaultTargetDeviceIds={["mock_id"]}
        onClose={() => {}}
        open={true}
        templateId={"mock_id"}
      />
    );
    expect(screen.getByText("Run Update Template")).toBeInTheDocument();
    expect(screen.getByText("mock_id")).toBeInTheDocument();
  });
});
