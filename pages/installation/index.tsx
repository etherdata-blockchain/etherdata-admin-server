// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { GetServerSideProps } from "next";
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import { IStaticNode } from "../../internal/services/dbSchema/install-script/static-node";
import { DockerImagePluginPlugin } from "../../internal/services/dbServices/docker-image-plugin";
import { StaticNodePlugin } from "../../internal/services/dbServices/static-node-plugin";
import { Configurations } from "../../internal/const/configurations";
import Spacer from "../../components/Spacer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps, TabPanel } from "../user/devices/detail/edit/[id]";
import DockerImagesPanel from "../../components/installation/DockerImagesPanel";

type Props = {
  images: IDockerImage[];
  staticNodes: IStaticNode[];
};

/**
 * Installation related pages
 * @param props
 * @constructor
 */
export default function Index({ images, staticNodes }: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <PageHeader
        title={"Installation"}
        description={`Configurations for installation script`}
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
        </Tabs>
        <TabPanel value={value} index={0}>
          <DockerImagesPanel dockerImages={images} />
        </TabPanel>
      </Box>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const dockerImagePlugin = new DockerImagePluginPlugin();
  const staticNodePlugin = new StaticNodePlugin();

  const images = await dockerImagePlugin.list(0, Configurations.numberPerPage);
  const staticNodes = await staticNodePlugin.list(
    0,
    Configurations.numberPerPage
  );

  const data: Props = {
    images: images?.results ?? [],
    staticNodes: staticNodes?.results ?? [],
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
