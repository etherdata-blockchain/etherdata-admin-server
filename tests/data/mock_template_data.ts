export const MockDockerImage = {
  imageName: "test",
  tags: [{ tag: "v1.0" }],
};

<<<<<<< HEAD
=======
export const MockDockerImage2 = {
  imageName: "test",
  tags: [{ tag: "v1.0" }, { tag: "v1.1" }],
};

>>>>>>> upstream/dev
export const MockInstallationTemplateData = {
  version: "3",
  services: {
    worker: {
<<<<<<< HEAD
      image: 0,
=======
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
>>>>>>> upstream/dev
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
<<<<<<< HEAD
      title: "worker",
=======
      name: "worker",
>>>>>>> upstream/dev
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
