export const MockDockerImage = {
  imageName: "test",
  tags: [{ tag: "v1.0" }],
};

export const MockDockerImage2 = {
  imageName: "test-2",
  tags: [{ tag: "v1.0" }, { tag: "v1.1" }],
};

export const MockInstallationTemplateData = {
  version: "3",
  services: {
    worker: {
      image: MockDockerImage,
      restart: "always",
      environment: [],
      volumes: [],
      labels: [],
    },
  },
  // eslint-disable-next-line camelcase
  template_tag: "test",
  // eslint-disable-next-line camelcase
  created_by: "",
};

export const MockComplicatedTemplateData = {
  version: "3",
  services: {
    worker: {
      image: MockDockerImage,
      restart: "always",
      environment: [],
      volumes: [],
      labels: [],
    },
    admin: {
      image: MockDockerImage2,
      restart: "always",
      environment: [],
      volumes: [],
      labels: [],
    },
  },
  // eslint-disable-next-line camelcase
  template_tag: "test",
  // eslint-disable-next-line camelcase
  created_by: "",
};

export const MockJSONSchemaFormInstallationTemplateData = {
  version: "3",
  services: [
    {
      name: "worker",
      service: {
        image: 0,
        restart: "always",
        environment: [],
        volumes: [],
        labels: [],
      },
    },
  ],
  // eslint-disable-next-line camelcase
  template_tag: "test",
  // eslint-disable-next-line camelcase
  created_by: "",
};
