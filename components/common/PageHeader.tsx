import { Fab, Fade, Stack, Typography } from "@mui/material";
import React from "react";
import Head from "next/head";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { UIProviderContext } from "../../pages/model/UIProvider";
import { configs } from "@etherdata-blockchain/common";

interface Props {
  title: string;
  description: string;
  action?: JSX.Element;
}

// eslint-disable-next-line require-jsdoc
export default function PageHeader({ title, description, action }: Props) {
  const { showAppBarTitle, hideAppBarTitle, appBarTitleShow } =
    React.useContext(UIProviderContext);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

  React.useEffect(() => {
    if (trigger) {
      showAppBarTitle(title);
    } else {
      hideAppBarTitle();
    }
  }, [trigger]);

  return (
    <div
      style={{
        paddingLeft: configs.Configurations.defaultPadding,
        paddingRight: configs.Configurations.defaultPadding,
      }}
    >
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} key="title" />
        <meta
          property="og:description"
          content={description}
          key="description"
        />
        <meta property="og:image" content="/images/logo/LOGO.JPG" />
      </Head>

      <Stack>
        <Stack direction={"row"} alignItems={"center"}>
          <div>
            <Typography
              variant="h4"
              style={{ fontSize: 30, fontWeight: "bold" }}
            >
              {title}
            </Typography>
          </div>
          <div style={{ flexGrow: 1 }} />
          {action}
          {action && (
            <Fade in={appBarTitleShow}>
              <Fab
                style={{
                  position: "fixed",
                  bottom: 20,
                  right: 20,
                  zIndex: 1000,
                }}
                variant="extended"
                size="medium"
                //@ts-ignore
                color="#28a5ed"
                aria-label="add"
              >
                {action}
              </Fab>
            </Fade>
          )}
        </Stack>
      </Stack>
    </div>
  );
}
