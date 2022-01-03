// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import { GetServerSideProps } from "next";
import { IDockerImage } from "../../internal/services/dbSchema/docker/docker-image";
import { IStaticNode } from "../../internal/services/dbSchema/install-script/static-node";
import { DockerImagePlugin } from "../../internal/services/dbServices/docker-image-plugin";
import { StaticNodePlugin } from "../../internal/services/dbServices/static-node-plugin";
import { Configurations } from "../../internal/const/configurations";
import Spacer from "../../components/common/Spacer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DockerImagesPanel from "../../components/installation/DockerImagesPanel";
import { InstallationPlugin } from "../../internal/services/dbServices/installation-plugin";
import { IInstallationTemplate } from "../../internal/services/dbSchema/install-script/install-script";
import InstallationTemplatePanel from "../../components/installation/InstallationTemplatePanel";
import { Button } from "@mui/material";
import { Routes } from "../../internal/const/routes";
import { useRouter } from "next/dist/client/router";
import StaticNodePanel from "../../components/installation/StaticNodePanel";
import WebhookPanel from "../../components/installation/WebhookPanel";
import qs from "query-string";
import { a11yProps, TabPanel } from "../../components/common/tabs/horizontal";
import "bootstrap/dist/css/bootstrap.min.css";
import { UIProviderContext } from "../model/UIProvider";
import app from "recharts/demo/container/App";
import { PaddingBox } from "../../components/common/PaddingBox";

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
export default function Index({
  index,
  images,
  staticNodes,
  installationTemplates,
  host,
}: Props) {
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = React.useState(parseInt(index));
  const { appBarTitleShow } = React.useContext(UIProviderContext);
  const router = useRouter();

  const handleChange = async (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    await router.push(
      qs.stringifyUrl({ url: Routes.installation, query: { index: newValue } })
    );
    setValue(newValue);
  };

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

  return (
    <div>
      <PageHeader
        title={"Installation"}
        description={`Configurations for installation script`}
        action={actions[value]}
      />
      <Spacer height={20} />
      <Box>
        <Box
          sx={{
            bgcolor: appBarTitleShow ? "background.paper" : undefined,
            width: "100%",
          }}
          style={{ position: "sticky", top: Configurations.appbarHeight }}
        >
          <Tabs
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            style={{
              paddingLeft: Configurations.defaultPadding,
              paddingRight: Configurations.defaultPadding,
            }}
          >
            <Tab label="Docker Images" {...a11yProps(0)} />
            <Tab label="Static Nodes" {...a11yProps(1)} />
            <Tab label="Installation Templates" {...a11yProps(2)} />
            <Tab label="Webhook" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <PaddingBox>
          <TabPanel value={value} index={0}>
            <DockerImagesPanel dockerImages={images} />
          </TabPanel>
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
        </PaddingBox>
      </Box>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const index = context.query.index ?? "0";

  //TODO: Add pagination
  const dockerImagePlugin = new DockerImagePlugin();
  const staticNodePlugin = new StaticNodePlugin();
  const installationPlugin = new InstallationPlugin();

  const imagePromise = dockerImagePlugin.list(
    Configurations.defaultPaginationStartingPage,
    Configurations.numberPerPage
  );
  const staticNodePromise = staticNodePlugin.list(
    Configurations.defaultPaginationStartingPage,
    Configurations.numberPerPage
  );
  const installationTemplatePromise = installationPlugin.list(
    Configurations.defaultPaginationStartingPage,
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
