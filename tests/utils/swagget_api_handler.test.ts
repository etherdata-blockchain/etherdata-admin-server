import { getUniqueTags } from "../../internal/handlers/swagger_api_handler";
import { OpenAPIV3 } from "openapi-types";

describe("Given a swagger handler", () => {
  describe("When calling get unique tags", () => {
    test("Should return a list of unique tags", () => {
      const spec: OpenAPIV3.Document = {
        info: {
          title: "Test",
          version: "3",
        },
        openapi: "",
        paths: {
          "/hello": {
            summary: "hello",
            get: { tags: ["a", "b"], responses: {}, summary: "hello" },
          },
        },
      };

      const tags = getUniqueTags(spec);
      expect(tags).toStrictEqual({
        a: [
          {
            path: "/hello",
            method: "GET",
            link: "#tag/a/paths/~1hello/get",
            name: "hello",
          },
        ],
        b: [
          {
            path: "/hello",
            method: "GET",
            link: "#tag/b/paths/~1hello/get",
            name: "hello",
          },
        ],
      });
    });

    test("Should return a list of unique tags", () => {
      const spec: OpenAPIV3.Document = {
        info: {
          title: "Test",
          version: "3",
        },
        openapi: "",
        paths: {
          "/hello": {
            summary: "hello",
            get: { tags: ["a b"], responses: {}, summary: "hello" },
          },
        },
      };

      const tags = getUniqueTags(spec);
      expect(tags).toStrictEqual({
        "a b": [
          {
            path: "/hello",
            method: "GET",
            link: "#tag/a-b/paths/~1hello/get",
            name: "hello",
          },
        ],
      });
    });

    test("Should return a list of unique tags", () => {
      const spec: OpenAPIV3.Document = {
        info: {
          title: "Test",
          version: "3",
        },
        openapi: "",
        paths: {
          "/hello/world": {
            summary: "hello",
            get: { tags: ["a"], responses: {}, summary: "hello" },
          },
        },
      };

      const tags = getUniqueTags(spec);
      expect(tags).toStrictEqual({
        a: [
          {
            name: "hello",
            path: "/hello/world",
            method: "GET",
            link: "#tag/a/paths/~1hello~1world/get",
          },
        ],
      });
    });

    test("Should return a list of unique tags", () => {
      const spec: OpenAPIV3.Document = {
        info: {
          title: "Test",
          version: "3",
        },
        openapi: "",
        paths: {
          "/hello": {
            get: { tags: [], responses: {}, summary: "hello" },
          },
        },
      };

      const tags = getUniqueTags(spec);
      expect(tags).toStrictEqual({});
    });

    test("Should return a list of unique tags", () => {
      const spec: OpenAPIV3.Document = {
        info: {
          title: "Test",
          version: "3",
        },
        openapi: "",
        paths: {
          "/hello": {
            summary: "hello",
            get: { tags: ["a", "b"], responses: {}, summary: "hello" },
          },
          "/world": {
            get: { tags: ["b", "c"], responses: {}, summary: "hello" },
          },
        },
      };

      const tags = getUniqueTags(spec);
      expect(tags).toStrictEqual({
        a: [
          {
            name: "hello",
            path: "/hello",
            method: "GET",
            link: "#tag/a/paths/~1hello/get",
          },
        ],
        b: [
          {
            name: "hello",
            path: "/hello",
            method: "GET",
            link: "#tag/b/paths/~1hello/get",
          },
          {
            name: "hello",
            path: "/world",
            method: "GET",
            link: "#tag/b/paths/~1world/get",
          },
        ],
        c: [
          {
            name: "hello",
            path: "/world",
            method: "GET",
            link: "#tag/c/paths/~1world/get",
          },
        ],
      });
    });
  });
});
