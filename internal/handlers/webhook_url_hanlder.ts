import qs from "query-string";
import jwt from "jsonwebtoken";
import { Environments } from "../../const/environments";
import { JSONSchema7 } from "json-schema";
import { Configurations } from "../../const/configurations";

/**
 * Generate webhook url for current user
 * @param{string} baseURL route with current host
 * @param{string} username username
 * @param{number} expireDuration How long the token will expire (in days)
 * @return{string} constructed url
 */
export function generateWebhookURL(
  baseURL: string,
  username: string,
  expireDuration: number
): [string | undefined, string | undefined] {
  if (expireDuration < 0) {
    return ["expireDuration should grater than 0", undefined];
  }

  const payload = {
    user: username,
  };
  try {
    const token = jwt.sign(
      payload,
      Environments.ClientSideEnvironments.NEXT_PUBLIC_SECRET,
      { expiresIn: expireDuration * 3600 * 24 }
    );
    const query = {
      token: token,
    };

    return [undefined, qs.stringifyUrl({ url: baseURL, query: query })];
  } catch (err) {
    return [`${err}`, undefined];
  }
}

export const schema: JSONSchema7 = {
  title: "Webhook URL Generator",
  description: "Generate a webhook url",
  required: ["username", "expireIn"],
  properties: {
    username: {
      title: "Username",
      description: "User identifier",
      type: "string",
      default: Configurations.defaultWebhookUser,
    },
    expireIn: {
      title: "Expire duration",
      description:
        "How long the token will be expire (in days). Default is set to 1 year",
      default: Configurations.defaultExpireDuration,
      type: "number",
    },
  },
};
