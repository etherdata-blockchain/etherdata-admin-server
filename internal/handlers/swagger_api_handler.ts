import { schema } from "@etherdata-blockchain/common";
import { createSwaggerSpec } from "next-swagger-doc";
import { Environments } from "@etherdata-blockchain/common/dist/configs";
import { OpenAPIV3 } from "openapi-types";
import { queryParameterSchema } from "../const/types";

export interface SwaggerContentType {
  path: string;
  method: string;
  link: string;
  name?: string;
}

export type SwaggerAPITableOfContentType = {
  [key: string]: SwaggerContentType[];
};

export const getSwaggerSpec = (baseURL: string) =>
  createSwaggerSpec({
    definition: {
      swagger: "2.0",
      servers: [{ url: baseURL }],
      info: {
        title: "Etherdata Admin",
        version: Environments.ClientSideEnvironments.NEXT_PUBLIC_VERSION,
      },
      schemes: ["https", "http"],
      securityDefinitions: {
        JWT: {
          type: "apiKey",
          in: "header",
          description:
            "jwt token of object {'user': 'user_id'} and signed by the PUBLIC_SECRET",
          name: "Authorization",
        },
      },
      definitions: {
        ...schema.storageInterfaceSchema.definitions,
        ...schema.deviceSchema.definitions,
        ...schema.jobResultSchema.definitions,
        ...schema.dockerSchema.definitions,
        ...schema.staticNodeSchema.definitions,
        ...schema.installationTemplateSchema.definitions,
        ...queryParameterSchema,
        PendingJob: {
          type: "object",
          properties: {
            targetDeviceId: {
              type: "string",
            },
            retrieved: {
              type: "boolean",
            },
            tries: {
              type: "number",
            },
          },
        },
      },
    },
  });

const addPath = (
  name: string | undefined,
  contents: SwaggerAPITableOfContentType,
  path: string,
  pathObject: { tags?: string[] },
  method: string
) => {
  const normalizeString = (s: string) => {
    return s.replaceAll("/", "~1").replaceAll(" ", "-");
  };

  if (pathObject.tags === undefined) {
    return;
  }

  for (const tag of pathObject.tags) {
    const prevValue = contents[tag];
    const link = `#tag/${normalizeString(tag)}/paths/${normalizeString(
      path
    )}/${normalizeString(method.toLowerCase())}`;
    if (prevValue === undefined) {
      contents[tag] = [{ name, path, method, link }];
      continue;
    }
    contents[tag] = [
      ...new Set(prevValue.concat([{ name, path, method, link }])),
    ];
  }
};

/**
 * Will return a map of tags and its path
 * @param spec
 */
export const getUniqueTags = (
  spec: OpenAPIV3.Document
): SwaggerAPITableOfContentType => {
  const uniqueTableOfContents: SwaggerAPITableOfContentType = {};

  for (const [key, value] of Object.entries(spec.paths)) {
    if (value?.get) {
      addPath(value.get.summary, uniqueTableOfContents, key, value.get, "GET");
    }

    if (value?.post) {
      addPath(
        value.post.summary,
        uniqueTableOfContents,
        key,
        value.post,
        "POST"
      );
    }

    if (value?.put) {
      addPath(value.put.summary, uniqueTableOfContents, key, value.put, "PUT");
    }

    if (value?.patch) {
      addPath(
        value.patch.summary,
        uniqueTableOfContents,
        key,
        value.patch,
        "PATCH"
      );
    }

    if (value?.delete) {
      addPath(
        value.delete.summary,
        uniqueTableOfContents,
        key,
        value.delete,
        "DELETE"
      );
    }
  }
  return uniqueTableOfContents;
};
