import React from "react";
import UserPage from "../../pages/user/index";
import "@testing-library/jest-dom";
import { render, within } from "@testing-library/react";
import UIProviderProvider from "../../pages/model/UIProvider";
import { createMatchMedia } from "../utils/utils";
import { configs, interfaces } from "@etherdata-blockchain/common";

describe("Given a user homepage", () => {
  beforeAll(() => {
    // @ts-ignore
    window.matchMedia = createMatchMedia(window.innerWidth);
  });

  test("When go to the first default page", async () => {
    const paginatedStorageUsers: interfaces.PaginationResult<any> = {
      count: 4,
      totalPage: 2,
      currentPage: 1,
      pageSize: configs.Configurations.numberPerPage,
      results: [
        {
          user_id: "1",
          user_name: "user_1",
          coinbase: "some_coinbase",
        },
        {
          user_id: "2",
          user_name: "user_2",
          coinbase: "some_coinbase_2",
        },
      ],
    };

    const screen = await render(
      <UIProviderProvider>
        <UserPage paginationResult={paginatedStorageUsers} currentPage={1} />
      </UIProviderProvider>
    );
    const { getByText } = within(await screen.findByTestId("pagination"));
    expect(getByText("1")).toBeInTheDocument();
    expect(getByText("2")).toBeInTheDocument();
  });
});
