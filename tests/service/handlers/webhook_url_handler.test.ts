import join from "url-join";
import { MockURL } from "../../data/mock_url";
import { Routes } from "../../../internal/const/routes";
import { generateWebhookURL } from "../../../internal/services/handlers/webhook_url_hanlder";
import { MockConstant } from "../../data/mock_constant";
import qs from "query-string";

describe("Given a web hook url generator", () => {
  beforeAll(() => {
    process.env = {
      ...process.env,
      NEXT_PUBLIC_SECRET: MockConstant.mockTestingSecret,
    };
  });

  test("When generate a url without port", () => {
    const baseURL = join(MockURL.mockHTTPURL, Routes.dockerWebhookAPI);
    const [err, generatedResult] = generateWebhookURL(
      baseURL,
      MockConstant.mockTestingUser,
      MockConstant.mockExpireDuration
    );

    expect(err).toBeUndefined();
    const parsedResult = qs.parseUrl(generatedResult!);
    expect(parsedResult.query.token).toBeDefined();
  });

  test("When generate a url with port", () => {
    const baseURL = join(MockURL.mockHTTPURLWithPort, Routes.dockerWebhookAPI);
    const [err, generatedResult] = generateWebhookURL(
      baseURL,
      MockConstant.mockTestingUser,
      MockConstant.mockExpireDuration
    );

    expect(err).toBeUndefined();
    const parsedResult = qs.parseUrl(generatedResult!);
    expect(parsedResult.query.token).toBeDefined();
  });
});
