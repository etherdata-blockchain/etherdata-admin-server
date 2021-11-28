import UserPage from "../../pages/user/index";
import { PaginatedStorageUsers } from "../../server/plugin/plugins/storageManagementSystemPlugin";
import "@testing-library/jest-dom";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { TestingValues } from "../../server/const/testingValues";
import UIProviderProvider from "../../pages/model/UIProvider";
import { createMatchMedia } from "../utils/utils";

describe("Given a user homepage", () => {
  beforeAll(() => {
    //@ts-ignore
    window.matchMedia = createMatchMedia(window.innerWidth);
  });

  test("When go to the first default page", async () => {
    const paginatedStorageUsers: PaginatedStorageUsers = {
      totalUsers: 2,
      totalPage: 1,
      users: [
        {
          _id: "1",
          id: "1",
          user_id: "1",
          user_name: "user_1",
          coinbase: "some_coinbase",
          balance: "100",
        },
        {
          _id: "2",
          id: "2",
          user_id: "2",
          user_name: "user_2",
          coinbase: "some_coinbase_2",
          balance: "100",
        },
      ],
    };

    const screen = await render(
      <UIProviderProvider>
        <UserPage paginationResult={paginatedStorageUsers} currentPage={0} />
      </UIProviderProvider>
    );
    const pagination = await screen.findByTestId(TestingValues.pagination);
    expect(pagination).toBeDefined();
  });
});
