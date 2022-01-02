import {
  expandImages,
  postprocessData,
} from "../../../internal/services/dbSchema/install-script/install-script-utils";
import { MockJSONSchemaFormInstallationTemplateData } from "../../data/mock_template_data";
import {
  MockDockerImage,
  MockDockerImage2,
  MockDockerImage3,
  MockDockerImage4,
} from "../../data/mock_docker_data";

describe("Given a install script utils", () => {
  test("When calling postprocess handler", () => {
    const result = postprocessData(
      MockJSONSchemaFormInstallationTemplateData as any
    );
    expect(result.services.worker).toBe(
      MockJSONSchemaFormInstallationTemplateData.services[0].service
    );
  });

  test("When calling expanding images", () => {
    const result = expandImages([MockDockerImage3]);
    expect(result.length).toBe(2);
  });

  test("When calling expanding images with multiple images", () => {
    const result = expandImages([
      MockDockerImage,
      MockDockerImage2,
      MockDockerImage3,
    ]);
    expect(result.length).toBe(4);
  });

  test("When calling expanding images with empty tag", () => {
    const result = expandImages([MockDockerImage4]);
    expect(result.length).toBe(1);
  });
});
