import { JSONSchema7 } from "json-schema";
import { GridColDef } from "@mui/x-data-grid";
import React from "react";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Button, IconButton } from "@mui/material";
import { DeviceIdField } from "../../components/update/DeviceIdField";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { ImageField } from "../../components/installation/DockerImageField";

const hostConfig: JSONSchema7 = {
  title: "Host Config",
  properties: {
    AutoRemove: {
      type: "boolean",
    },
    Binds: {
      type: "array",
      description: "Bind your local volume to ",
      items: {
        type: "string",
      },
    },
    ContainerIDFile: {
      type: "string",
    },
    LogConfig: {
      type: "object",
      properties: {
        Type: {
          type: "string",
        },
        Config: {},
      },
      additionalProperties: false,
    },
    NetworkMode: {
      type: "string",
      enum: ["bridge", "host", "none"],
    },
    PortBindings: {},
    RestartPolicy: {
      type: "string",
      enum: ["no", "on-failure", "always", "unless-stopped"],
    },
    VolumeDriver: {
      type: "string",
    },
    VolumesFrom: {},
    CapAdd: {},
    CapDrop: {},
    Dns: {
      type: "array",
      items: {},
    },
    DnsOptions: {
      type: "array",
      items: {},
    },
    DnsSearch: {
      type: "array",
      items: {},
    },
    ExtraHosts: {},
    GroupAdd: {
      type: "array",
      items: {
        type: "string",
      },
    },
    IpcMode: {
      type: "string",
    },
    Cgroup: {
      type: "string",
    },
    Links: {},
    OomScoreAdj: {
      type: "number",
    },
    PidMode: {
      type: "string",
    },
    Privileged: {
      type: "boolean",
    },
    PublishAllPorts: {
      type: "boolean",
    },
    ReadonlyRootfs: {
      type: "boolean",
    },
    SecurityOpt: {},
    StorageOpt: {
      type: "object",
      additionalProperties: {
        type: "string",
      },
    },
    Tmpfs: {
      type: "object",
      additionalProperties: {
        type: "string",
      },
    },
    UTSMode: {
      type: "string",
    },
    UsernsMode: {
      type: "string",
    },
    ShmSize: {
      type: "number",
    },
    Sysctls: {
      type: "object",
      additionalProperties: {
        type: "string",
      },
    },
    Runtime: {
      type: "string",
    },
    ConsoleSize: {
      type: "array",
      items: {
        type: "number",
      },
    },
    Isolation: {
      type: "string",
    },
    MaskedPaths: {
      type: "array",
      items: {
        type: "string",
      },
    },
    ReadonlyPaths: {
      type: "array",
      items: {
        type: "string",
      },
    },
    CpuShares: {
      type: "number",
    },
    CgroupParent: {
      type: "string",
    },
    BlkioWeight: {
      type: "number",
    },
    BlkioWeightDevice: {},
    BlkioDeviceReadBps: {},
    BlkioDeviceWriteBps: {},
    BlkioDeviceReadIOps: {},
    BlkioDeviceWriteIOps: {},
    CpuPeriod: {
      type: "number",
    },
    CpuQuota: {
      type: "number",
    },
    CpusetCpus: {
      type: "string",
    },
    CpusetMems: {
      type: "string",
    },
    Devices: {},
    DeviceCgroupRules: {
      type: "array",
      items: {
        type: "string",
      },
    },
    DiskQuota: {
      type: "number",
    },
    KernelMemory: {
      type: "number",
    },
    Memory: {
      type: "number",
    },
    MemoryReservation: {
      type: "number",
    },
    MemorySwap: {
      type: "number",
    },
    MemorySwappiness: {
      type: "number",
    },
    OomKillDisable: {
      type: "boolean",
    },
    Init: {
      type: "boolean",
    },
    PidsLimit: {
      type: "number",
    },
    Ulimits: {},
  },
};

export const jsonSchema: JSONSchema7 = {
  description:
    "Update template is a declarative syntax of update template. It will be sent to every devices" +
    "in the group. Each device will follow the update template's instruction to pull, create, remove, or delete" +
    "the images or containers.",
  properties: {
    name: {
      type: "string",
      description: "Template's name",
    },
    targetDeviceIds: {
      title: "Target Devices' id",
      type: "array",
      items: {
        type: "string",
      },
    },
    from: {
      type: "string",
      default: "admin",
    },
    imageStacks: {
      title: "Docker Images",
      description: "Will use this field to pull images from remote",
      type: "array",
      items: {
        type: "object",
        title: "Docker Image ID",
        properties: {
          image: { type: "string" },
          tag: { type: "string" },
        },
      },
    },
    containerStacks: {
      title: "Docker Container",
      description: "Will use this field to create containers",
      type: "array",
      items: {
        type: "object",
        properties: {
          containerName: {
            type: "string",
            title: "Container Name",
          },
          image: {
            type: "object",
            title: "Docker Image ID",
            properties: {
              image: { type: "string" },
              tag: { type: "string" },
            },
          },
          config: {
            title: "Container Configurations",
            type: "object",
            properties: {
              HostName: { type: "string" },
              Domainname: { type: "string" },
              User: { type: "string" },
              AttachStdin: { type: "boolean" },
              AttachStdout: { type: "boolean" },
              AttachStderr: { type: "boolean" },
              Tty: { type: "string" },
              OpenStdin: { type: "boolean" },
              StdinOnce: { type: "boolean" },
              Env: { type: "array", items: { type: "string" } },
              Cmd: { type: "array", items: { type: "string" } },
              Entrypoint: { type: "string" },
              Labels: { type: "array", items: { type: "string" } },
              Volumes: {
                type: "array",
                items: {
                  type: "object",
                  required: ["from", "to"],
                  properties: {
                    from: {
                      type: "string",
                    },
                    to: {
                      type: "string",
                    },
                  },
                },
              },
              WorkingDir: { type: "string" },
              NetworkDisabled: { type: "string" },
              MacAddress: { type: "string" },
              ExposedPorts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                  },
                },
              },
              StopSignal: { type: "string" },
              StopTimeout: { type: "number" },
              HostConfig: hostConfig,
            },
          },
        },
      },
    },
  },
};

export const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
  },
  {
    field: "name",
    headerName: "Name",
  },
  {
    field: "createdAt",
    headerName: "Creation time",
    flex: 3,
  },
  {
    field: "updatedAt",
    headerName: "Updated time",
    flex: 3,
  },
  {
    field: "details",
    headerName: "Details",
    flex: 2,
    renderCell: (param) => {
      return (
        <Button
          onClick={() =>
            (window.location.pathname = `${Routes.updateTemplateEdit}/${param.value}`)
          }
        >
          Details
        </Button>
      );
    },
  },
  {
    field: "run",
    headerName: "Run",
    flex: 2,
    renderCell: (param) => {
      return (
        <IconButton
          onClick={() =>
            (window.location.pathname = `${Routes.updateTemplateRun}/${param.value}`)
          }
        >
          <PlayCircleIcon />
        </IconButton>
      );
    },
  },
];

export const UISchema = {
  targetDeviceIds: {
    "ui:ArrayFieldTemplate": DeviceIdField,
  },
  imageStacks: {
    items: {
      "ui:ObjectFieldTemplate": ImageField,
    },
  },
  containerStacks: {
    items: {
      image: {
        "ui:ObjectFieldTemplate": ImageField,
      },
    },
  },
};
