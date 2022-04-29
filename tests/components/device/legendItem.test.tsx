import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LegendItem } from "../../../components/chart/legendItem";

describe("Given a container legend item", () => {
  test("Should render correctly", async () => {
    render(
      <LegendItem title={"mock_title"} count={1} size={20} color={"red"} />
    );

    expect(screen.getByText("mock_title")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
