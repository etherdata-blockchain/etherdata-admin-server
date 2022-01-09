import { convertFromToArrayToMap } from "../../../internal/services/dbSchema/update-template/update-template-utils";

describe("Given an update template utils", () => {
  test("When calling convertFromToArrayToMap", () => {
    const obj = {
      name: "Hello",
      envs: [
        {
          from: "a",
          to: "b",
        },
        {
          from: "c",
          to: "d",
        },
      ],
    };
    const result = convertFromToArrayToMap(obj, ["envs"]);
    expect(result.name).toBe(obj.name);
    expect(result.envs).toStrictEqual({ a: "b", c: "d" });
  });

  test("When calling convertFromToArrayToMap", () => {
    const obj = {
      name: "Hello",
      config: {
        envs: [
          {
            from: "a",
            to: "b",
          },
          {
            from: "c",
            to: "d",
          },
        ],
      },
    };
    const result = convertFromToArrayToMap(obj, ["envs"]);
    expect(result.name).toBe(obj.name);
    expect(result.config.envs).toStrictEqual({ a: "b", c: "d" });
  });
});
