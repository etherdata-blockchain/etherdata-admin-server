// @flow
import * as React from "react";
import { UIProviderContext } from "../model/UIProvider";
import { useRouter } from "next/dist/client/router";
import qs from "query-string";
import { Routes } from "../../internal/const/routes";
import { Button } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import Spacer from "../../components/common/Spacer";
import Box from "@mui/material/Box";
import { Configurations } from "../../internal/const/configurations";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps } from "../../components/common/tabs/horizontal";
import { PaddingBox } from "../../components/common/PaddingBox";
import { GetServerSideProps } from "next";
import { Environments } from "../../internal/const/environments";
import { Form } from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";

type Props = {
  tabIndex: number;
  envs: {
    clientEnvs: { [key: string]: string };
    serverEnvs: { [key: string]: string };
  };
};

/**
 * Settings page
 * @param props
 * @constructor
 */
export default function Index(props: Props) {
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = React.useState(props.tabIndex);
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
        title={"Settings"}
        description={`List of settings`}
        action={actions[value]}
      />
      <Spacer height={20} />

      <Box
        sx={{
          bgcolor: appBarTitleShow ? "background.paper" : undefined,
          width: "100%",
          zIndex: 1000,
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
          <Tab label="Environments" {...a11yProps(0)} />
        </Tabs>
      </Box>
      <PaddingBox>
        <Form
          readonly
          schema={Environments.getSchemaForEnvironments(
            props.envs.serverEnvs,
            props.envs.clientEnvs
          )}
        />
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const index = context.query.index ?? "0";

  const data: Props = {
    tabIndex: parseInt(index as string),
    envs: {
      clientEnvs: { ...Environments.ServerSideEnvironments },
      serverEnvs: { ...Environments.ClientSideEnvironments },
    },
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
