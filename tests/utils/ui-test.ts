import { createMatchMedia } from "./utils";
import { mockData } from "@etherdata-blockchain/common";

export const beforeUITest = () => {
  // @ts-ignore
  window.matchMedia = createMatchMedia(window.innerWidth);
  process.env = {
    ...process.env,
    NEXT_PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
  };
};
