export interface DockerComposeInterface {
  version: string;
  services: { [key: string]: Service };
}

interface Service {
  image: string;
  restart: "always";
  environment: string[];
  // eslint-disable-next-line camelcase
  network_mode: string;
  volumes: string[];
  labels: string[];
}
