// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { GetServerSideProps } from "next";
<<<<<<< HEAD
<<<<<<< HEAD
import { IDockerImage } from "../../services/dbSchema/docker-image";
import { IStaticNode } from "../../services/dbSchema/static-node";
import { DockerImagePluginPlugin } from "../../services/dbServices/dockerImagePlugin";
import { StaticNodePlugin } from "../../services/dbServices/staticNodePlugin";
import { Configurations } from "../../server/const/configurations";
=======
=======
>>>>>>> upstream/dev
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import { IStaticNode } from "../../internal/services/dbSchema/install-script/static-node";
import { DockerImagePlugin } from "../../internal/services/dbServices/docker-image-plugin";
import { StaticNodePlugin } from "../../internal/services/dbServices/static-node-plugin";
import { Configurations } from "../../internal/const/configurations";
<<<<<<< HEAD
>>>>>>> upstream/install-script
=======
>>>>>>> upstream/dev
import Spacer from "../../components/Spacer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps, TabPanel } from "../user/devices/detail/edit/[id]";
import DockerImagesPanel from "../../components/installation/DockerImagesPanel";
<<<<<<< HEAD
<<<<<<< HEAD

type Props = {
  images: IDockerImage[];
  staticNodes: IStaticNode[];
=======
=======
>>>>>>> upstream/dev
import { InstallationPlugin } from "../../internal/services/dbServices/installation-plugin";
import { IInstallationTemplate } from "../../internal/services/dbSchema/install-script/install-script";
import InstallationTemplatePanel from "../../components/installation/InstallationTemplatePanel";
import { Button } from "@mui/material";
import { Routes } from "../../internal/const/routes";
import { useRouter } from "next/dist/client/router";
import StaticNodePanel from "../../components/installation/StaticNodePanel";
import WebhookPanel from "../../components/installation/WebhookPanel";
import qs from "query-string";

type Props = {
  index: any;
  images: IDockerImage[];
  staticNodes: IStaticNode[];
  installationTemplates: IInstallationTemplate[];
  host: string;
};

/**
 * Installation related pages
 * @param props
 * @constructor
 */
<<<<<<< HEAD
<<<<<<< HEAD
export default function Index({ images, staticNodes }: Props) {
  const [value, setValue] = React.useState(0);
=======
=======
>>>>>>> upstream/dev
export default function Index({
  index,
  images,
  staticNodes,
  installationTemplates,
  host,
}: Props) {
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = React.useState(parseInt(index));
  const router = useRouter();
<<<<<<< HEAD
>>>>>>> upstream/install-script
=======
>>>>>>> upstream/dev

  const handleChange = async (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    await router.push(
      qs.stringifyUrl({ url: Routes.installation, query: { index: newValue } })
    );
    setValue(newValue);
  };

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> upstream/dev
  const actions: React.ReactElement[] = [
    <Button
      key={`button-0`}
      onClick={() => router.push(Routes.dockerImageCreate)}
    >
      Add Image{" "}
    </Button>,
    <Button
      key={`button-1`}
      onClick={() => router.push(Routes.staticNodeCreate)}
    >
      Add Static Node
    </Button>,
    <Button
      key={`button-2`}
      onClick={() => router.push(Routes.installationTemplatesCreate)}
    >
      Add New Template
    </Button>,
  ];

<<<<<<< HEAD
>>>>>>> upstream/install-script
=======
>>>>>>> upstream/dev
  return (
    <div>
      <PageHeader
        title={"Installation"}
        description={`Configurations for installation script`}
<<<<<<< HEAD
<<<<<<< HEAD
=======
        action={actions[value]}
>>>>>>> upstream/install-script
=======
        action={actions[value]}
>>>>>>> upstream/dev
      />
      <Spacer height={20} />
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.paper",
          display: "flex",
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Docker Images" {...a11yProps(0)} />
          <Tab label="Static Nodes" {...a11yProps(1)} />
<<<<<<< HEAD
<<<<<<< HEAD
=======
          <Tab label="Installation Templates" {...a11yProps(2)} />
>>>>>>> upstream/install-script
=======
          <Tab label="Installation Templates" {...a11yProps(2)} />
          <Tab label="Webhook" {...a11yProps(3)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <DockerImagesPanel dockerImages={images} />
        </TabPanel>
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> upstream/dev
        <TabPanel value={value} index={1}>
          <StaticNodePanel staticNodes={staticNodes} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <InstallationTemplatePanel
            installationTemplates={installationTemplates}
          />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <WebhookPanel host={host} />
        </TabPanel>
      </Box>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const dockerImagePlugin = new DockerImagePluginPlugin();
  const staticNodePlugin = new StaticNodePlugin();

  const images = await dockerImagePlugin.list(0, Configurations.numberPerPage);
  const staticNodes = await staticNodePlugin.list(
    0,
    Configurations.numberPerPage
  );

  const data: Props = {
    images: images ?? [],
    staticNodes: staticNodes ?? [],
=======
=======
>>>>>>> upstream/dev
  const index = context.query.index ?? "0";

  //TODO: Add pagination
  const dockerImagePlugin = new DockerImagePlugin();
  const staticNodePlugin = new StaticNodePlugin();
  const installationPlugin = new InstallationPlugin();

  const imagePromise = dockerImagePlugin.list(0, Configurations.numberPerPage);
  const staticNodePromise = staticNodePlugin.list(
    0,
    Configurations.numberPerPage
  );
  const installationTemplatePromise = installationPlugin.list(
    0,
    Configurations.numberPerPage
  );

  const [images, staticNodes, installationTemplates] = await Promise.all([
    imagePromise,
    staticNodePromise,
    installationTemplatePromise,
  ]);

  const data: Props = {
    index: index,
    images: images?.results ?? [],
    staticNodes: staticNodes?.results ?? [],
    installationTemplates: installationTemplates?.results ?? [],
    host: context.req.headers.host ?? "",
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
