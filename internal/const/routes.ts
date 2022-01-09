export const Routes = {
  // Installation template related
  installation: "/installation",
  installationTemplatesCreate: "/installation/installation-template/create",
  installationTemplatesEdit: "/installation/installation-template/edit",
  installationTemplatesAPICreate: "/api/v1/installation-template",
  installationTemplatesAPIEdit: "/api/v1/installation-template",
  installationTemplateAPIDownload: "/api/v1/installation-template/download",
  // Docker image related
  dockerImageCreate: "/installation/docker/create",
  dockerImageEdit: "/installation/docker/edit",
  dockerImageAPICreate: "/api/v1/docker",
  dockerImageAPIEdit: "/api/v1/docker",
  dockerWebhookAPI: "api/v1/docker/webhook",
  dockerSearchAPI: "/api/v1/docker/search",
  // Static Nodes related
  staticNodeCreate: "/installation/static-node/create",
  staticNodeEdit: "/installation/static-node/edit",
  staticNodeAPICreate: "/api/v1/static-node",
  staticNodeAPIEdit: "/api/v1/static-node",
  // Storage
  item: "/storage_management/item",
  itemSearch: "/api/v1/device/search",
  owner: "/storage_management/owner",
  // Device
  devicesWithStatus: "/api/v1/device/devices-with-status",
  // Update
  update: "/update",
  updateTemplateCreate: "/update/template/create",
  updateTemplateEdit: "/update/template/edit",
  updateTemplateAPICreate: "/api/v1/update-template",
  updateTemplateAPIEdit: "/api/v1/update-template",
  updateTemplateRun: "/update/template/run",
  updateTemplateAPIRun: "/api/v1/update-template/run",
  // ExecutionPlan
  executionPlanAPIGet: "/api/v1/update-template/execution-plan",
  // Settings
  settings: "/settings",
};
