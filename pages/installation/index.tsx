// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { GetServerSideProps } from "next";
<<<<<<< HEAD
import { IDockerImage } from "../../services/dbSchema/docker-image";
import { IStaticNode } from "../../services/dbSchema/static-node";
import { DockerImagePluginPlugin } from "../../services/dbServices/dockerImagePlugin";
import { StaticNodePlugin } from "../../services/dbServices/staticNodePlugin";
import { Configurations } from "../../server/const/configurations";
=======
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import { IStaticNode } from "../../internal/services/dbSchema/install-script/static-node";
import { DockerImagePlugin } from "../../internal/services/dbServices/docker-image-plugin";
import { StaticNodePlugin } from "../../internal/services/dbServices/static-node-plugin";
import { Configurations } from "../../internal/const/configurations";
>>>>>>> upstream/install-script
import Spacer from "../../components/Spacer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps, TabPanel } from "../user/devices/detail/edit/[id]";
import DockerImagesPanel from "../../components/installation/DockerImagesPanel";
<<<<<<< HEAD

type Props = {
  images: IDockerImage[];
  staticNodes: IStaticNode[];
=======
import { InstallationPlugin } from "../../internal/services/dbServices/installation-plugin";
import { IInstallationTemplate } from "../../internal/services/dbSchema/install-script/install-script";
import InstallationTemplatePanel from "../../components/installation/InstallationTemplatePanel";
import { Button } from "@mui/material";
import { Routes } from "../../internal/const/routes";
import { useRouter } from "next/dist/client/router";
import StaticNodePanel from "../../components/installation/StaticNodePanel";

type Props = {
  index: any;
  images: IDockerImage[];
  staticNodes: IStaticNode[];
  installationTemplates: IInstallationTemplate[];
>>>>>>> upstream/install-script
};

/**
 * Installation related pages
 * @param props
 * @constructor
 */
<<<<<<< HEAD
export default function Index({ images, staticNodes }: Props) {
  const [value, setValue] = React.useState(0);
=======
export default function Index({
  index,
  images,
  staticNodes,
  installationTemplates,
}: Props) {
  const [value, setValue] = React.useState(parseInt(index));
  const router = useRouter();
>>>>>>> upstream/install-script

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

<<<<<<< HEAD
=======
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

>>>>>>> upstream/install-script
  return (
    <div>
      <PageHeader
        title={"Installation"}
        description={`Configurations for installation script`}
<<<<<<< HEAD
=======
        action={actions[value]}
>>>>>>> upstream/install-script
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
=======
          <Tab label="Installation Templates" {...a11yProps(2)} />
>>>>>>> upstream/install-script
        </Tabs>
        <TabPanel value={value} index={0}>
          <DockerImagesPanel dockerImages={images} />
        </TabPanel>
<<<<<<< HEAD
=======
        <TabPanel value={value} index={1}>
          <StaticNodePanel staticNodes={staticNodes} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <InstallationTemplatePanel
            installationTemplates={installationTemplates}
          />
        </TabPanel>
>>>>>>> upstream/install-script
      </Box>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
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
>>>>>>> upstream/install-script
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
