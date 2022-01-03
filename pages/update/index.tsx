// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import { GetServerSideProps } from "next";
import Spacer from "../../components/common/Spacer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Button } from "@mui/material";
import { Routes } from "../../internal/const/routes";
import { useRouter } from "next/dist/client/router";
import qs from "query-string";
import { a11yProps, TabPanel } from "../../components/common/tabs/horizontal";
import { IUpdateTemplate } from "../../internal/services/dbSchema/update-template/update_template";
import { UpdateScriptPlugin } from "../../internal/services/dbServices/update-script-plugin";
import { Configurations } from "../../internal/const/configurations";
import { PaginationResult } from "../../internal/const/common_interfaces";
import { UIProviderContext } from "../model/UIProvider";
import { PaddingBox } from "../../components/common/PaddingBox";
import UpdateTemplatePanel from "../../components/update/UpdateTemplatePanel";

type Props = {
  updateTemplate: PaginationResult<IUpdateTemplate>;
  tabIndex: number;
};

/**
 * Update template
 * @param props
 * @constructor
 */
export default function Index({ tabIndex, updateTemplate }: Props) {
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = React.useState(tabIndex);
  const { appBarTitleShow } = React.useContext(UIProviderContext);
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
      <PageHeader
        title={"Update template"}
        description={`Update template`}
        action={actions[value]}
      />
      <Spacer height={20} />
      <PaddingBox>
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
            <Tab label="Update Template" {...a11yProps(0)} />
          </Tabs>
        </Box>
        <PaddingBox>
          <TabPanel index={0} value={value}>
            <UpdateTemplatePanel updateTemplates={updateTemplate.results} />
          </TabPanel>
        </PaddingBox>
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const index = context.query.index ?? "0";
  const page =
    context.query.page ?? `${Configurations.defaultPaginationStartingPage}`;

  const updatePlugin = new UpdateScriptPlugin();

  const updateTemplate = await updatePlugin.list(
    parseInt(page as string),
    Configurations.numberPerPage
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
