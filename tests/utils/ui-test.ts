import { createMatchMedia } from "./utils";
import { MockConstant } from "../data/mock_constant";

export const beforeUITest = () => {
  // @ts-ignore
  window.matchMedia = createMatchMedia(window.innerWidth);
  process.env = {
    ...process.env,
    NEXT_PUBLIC_SECRET: MockConstant.mockTestingSecret,
  };
};
