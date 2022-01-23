const YAML = require("yaml");

module.exports.readVersion = function (contents) {
  const yamlFileContent = YAML.parse(contents);
  const image = yamlFileContent.spec.template.spec.containers[0].image;
  const version = image.split(":")[1];
  return version.replace("v", "");
};

module.exports.writeVersion = function (contents, version) {
  const yamlFileContent = YAML.parse(contents);
  yamlFileContent.spec.template.spec.containers[0].image = `sirily11/etd-remote-admin-server:v${version}`;
  yamlFileContent.spec.template.spec.containers[0].env[0].value = `v${version}`;
  return YAML.stringify(yamlFileContent);
};
