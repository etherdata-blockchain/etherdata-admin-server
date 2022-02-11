const YAML = require("yaml");
const fs = require("fs");

const version = process.argv[2];

const filePath = "example_configs/k8s/deployment.yml";
const fileContent = fs.readFileSync(filePath, "utf-8");
const yamlFileContent = YAML.parse(fileContent);
yamlFileContent.spec.template.spec.containers[0].image = `sirily11/etd-remote-admin-server:${version}`;
yamlFileContent.spec.template.spec.containers[0].env[0].value = `${version}`;
const newFileContent = YAML.stringify(yamlFileContent);
fs.writeFileSync(filePath, newFileContent);
