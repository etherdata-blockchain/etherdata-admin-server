// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import { GetServerSideProps } from "next";
import Spacer from "../../components/common/Spacer";
import Box from "@mui/material/Box";
import DockerImagesPanel from "../../components/installation/DockerImagesPanel";
import InstallationTemplatePanel from "../../components/installation/InstallationTemplatePanel";
import { Button } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import StaticNodePanel from "../../components/installation/StaticNodePanel";
import WebhookPanel from "../../components/installation/WebhookPanel";
import { TabPanel } from "../../components/common/tabs/horizontal";
import { UIProviderContext } from "../../model/UIProvider";
import { PaddingBox } from "../../components/common/PaddingBox";
import { configs } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import "bootstrap/dist/css/bootstrap.min.css";
import { useStickyTabBar } from "../../hooks/useStickyTabBar";
import { StickyTabs } from "../../components/common/stickyTabs";

type Props = {
  index: any;
  images: schema.IDockerImage[];
  staticNodes: schema.IStaticNode[];
  installationTemplates: schema.IInstallationTemplate[];
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
  const [value, setValue] = useStickyTabBar(index);
  const router = useRouter();

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
        <StickyTabs
          initialIndex={parseInt(index)}
          labels={[
            "Docker Images",
            "Static Nodes",
            "Installation Templates",
            "Webhook",
          ]}
          pushTo={Routes.installation}
          urlKeyName={"index"}
        />
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
  const dockerImagePlugin = new dbServices.DockerImageService();
  const staticNodePlugin = new dbServices.StaticNodeService();
  const installationPlugin = new dbServices.InstallationService();

  const imagePromise = dockerImagePlugin.list(
    configs.Configurations.defaultPaginationStartingPage,
    configs.Configurations.numberPerPage
  );
  const staticNodePromise = staticNodePlugin.list(
    configs.Configurations.defaultPaginationStartingPage,
    configs.Configurations.numberPerPage
  );
  const installationTemplatePromise = installationPlugin.list(
    configs.Configurations.defaultPaginationStartingPage,
    configs.Configurations.numberPerPage
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
