// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { GetServerSideProps } from "next";
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import { IStaticNode } from "../../internal/services/dbSchema/install-script/static-node";
import { DockerImagePlugin } from "../../internal/services/dbServices/docker-image-plugin";
import { StaticNodePlugin } from "../../internal/services/dbServices/static-node-plugin";
import { Configurations } from "../../internal/const/configurations";
import Spacer from "../../components/Spacer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps, TabPanel } from "../user/devices/detail/edit/[id]";
import DockerImagesPanel from "../../components/installation/DockerImagesPanel";
import { InstallationPlugin } from "../../internal/services/dbServices/installation-plugin";
import { IInstallationTemplate } from "../../internal/services/dbSchema/install-script/install-script";
import InstallationTemplatePanel from "../../components/installation/InstallationTemplatePanel";
import { Button } from "@mui/material";
import { Routes } from "../../internal/const/routes";
import { useRouter } from "next/dist/client/router";

type Props = {
  images: IDockerImage[];
  staticNodes: IStaticNode[];
  installationTemplates: IInstallationTemplate[];
};

/**
 * Installation related pages
 * @param props
 * @constructor
 */
export default function Index({
  images,
  staticNodes,
  installationTemplates,
}: Props) {
  const [value, setValue] = React.useState(0);
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const actions: React.ReactElement[] = [
    <Button
      key={`button-0`}
      onClick={() => router.push(Routes.dockerImageCreate)}
    >
      Add Image{" "}
    </Button>,
    <Button key={`button-1`}></Button>,
    <Button
      key={`button-2`}
      onClick={() => router.push(Routes.installationTemplatesCreate)}
    >
      Add New Template
    </Button>,
  ];

  return (
    <div>
      <PageHeader
        title={"Installation"}
        description={`Configurations for installation script`}
        action={actions[value]}
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
          <Tab label="Installation Templates" {...a11yProps(2)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <DockerImagesPanel dockerImages={images} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <InstallationTemplatePanel
            installationTemplates={installationTemplates}
          />
        </TabPanel>
      </Box>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  //TODO: Add pagination
  const dockerImagePlugin = new DockerImagePlugin();
  const staticNodePlugin = new StaticNodePlugin();
  const installationPlugin = new InstallationPlugin();

  const images = await dockerImagePlugin.list(0, Configurations.numberPerPage);
  const staticNodes = await staticNodePlugin.list(
    0,
    Configurations.numberPerPage
  );
  const installationTemplates = await installationPlugin.list(
    0,
    Configurations.numberPerPage
  );

  const data: Props = {
    images: images?.results ?? [],
    staticNodes: staticNodes?.results ?? [],
    installationTemplates: installationTemplates?.results ?? [],
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
