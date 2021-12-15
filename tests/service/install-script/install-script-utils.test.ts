import {
  postprocessData,
  preprocessData,
} from "../../../internal/services/dbSchema/install-script/install-script-utils";
import {
  MockInstallationTemplateData,
  MockJSONSchemaFormInstallationTemplateData,
} from "../../data/mock_template_data";

describe("Given a install script utils", () => {
  test("When calling preprocess handler", () => {
    const result = preprocessData(MockInstallationTemplateData as any);
    expect(result.services.length).toBe(1);
    expect(result.services[0].title).toBe("worker");
    expect(result.services[0].service).toBe(
      MockInstallationTemplateData.services.worker
    );
  });

  test("When calling postprocess handler", () => {
    const result = postprocessData(
      MockJSONSchemaFormInstallationTemplateData as any
    );
    expect(result.services.worker).toBe(
      MockJSONSchemaFormInstallationTemplateData.services[0].service
    );
  });
});
