const YAML = require("yaml");
const fs = require("fs");

const packageJsonFile = fs.readFileSync("./package.json", "utf-8");
const deploymentFile = fs.readFileSync("./k8s/deployment.yml", "utf-8");
const deploymentConfig = YAML.parse(deploymentFile);
const packageJson = JSON.parse(packageJsonFile);
const version = packageJson.version;

console.log("Updating deployment version to: " + version);
deploymentConfig.spec.template.spec.containers[0].image = `sirily11/etd-remote-admin-server:${version}`;
fs.writeFileSync("./k8s/deployment.yml", YAML.stringify(deploymentConfig));
