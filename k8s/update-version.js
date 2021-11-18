const YAML = require("yaml");

module.exports.readVersion = function (contents) {
  const yamlFileContent = YAML.parse(contents);
  const image = yamlFileContent.spec.template.spec.containers[0].image;
  const version = image.split(":")[1];
  console.log(version);
  return version;
};

module.exports.writeVersion = function (contents, version) {
  const yamlFileContent = YAML.parse(contents);
  yamlFileContent.spec.template.spec.containers[0].image = `sirily11/etd-remote-admin-server:${version}`;
  return YAML.stringify(yamlFileContent);
};
