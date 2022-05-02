// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import { GetServerSideProps } from "next";
import Spacer from "../../components/common/Spacer";
import { Button } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import qs from "query-string";
import { TabPanel } from "../../components/common/tabs/horizontal";
import { PaddingBox } from "../../components/common/PaddingBox";
import UpdateTemplatePanel from "../../components/update/UpdateTemplatePanel";
import { configs, interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { useStickyTabBar } from "../../hooks/useStickyTabBar";
import { StickyTabs } from "../../components/common/stickyTabs";

type Props = {
  updateTemplate: interfaces.PaginationResult<schema.IUpdateTemplate>;
  tabIndex: number;
};

/**
 * Update template
 * @param props
 * @constructor
 */
export default function Index({ tabIndex, updateTemplate }: Props) {
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = useStickyTabBar();
  const router = useRouter();

  const handleChange = async (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    await router.push(
      qs.stringifyUrl({ url: Routes.update, query: { index: newValue } })
    );
    setValue(newValue);
  };

  const actions: React.ReactElement[] = [
    <Button
      key={`button-0`}
      onClick={() => router.push(Routes.updateTemplateCreate)}
    >
      Add Template
    </Button>,
  ];

  return (
    <div>
      <Spacer height={20} />
      <PageHeader
        title={"Update template"}
        description={`Update template`}
        action={actions[value]}
      />
      <Spacer height={20} />
      <StickyTabs
        initialIndex={tabIndex}
        labels={["Update Template"]}
        pushTo={Routes.update}
        urlKeyName={"index"}
      />
      <PaddingBox>
        <TabPanel index={0} value={value}>
          <UpdateTemplatePanel updateTemplates={updateTemplate.results} />
        </TabPanel>
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const index = context.query.index ?? "0";
  const page =
    context.query.page ??
    `${configs.Configurations.defaultPaginationStartingPage}`;

  const updatePlugin = new dbServices.UpdateTemplateService();

  const updateTemplate = await updatePlugin.list(
    parseInt(page as string),
    configs.Configurations.numberPerPage
  );

  if (updateTemplate === undefined) {
    return {
      notFound: true,
    };
  }

  const data: Props = {
    updateTemplate: updateTemplate!,
    tabIndex: parseInt(index as string),
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
