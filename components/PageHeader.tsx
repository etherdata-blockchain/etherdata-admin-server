import {
  AppBar,
  Hidden,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import React from "react";
import Head from "next/head";
import MenuIcon from "@material-ui/icons/Menu";
import { UIProviderContext } from "../pages/model/UIProvider";

interface Props {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: Props) {
  const { setDrawerOpen } = React.useContext(UIProviderContext);

  return (
    <div>
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
      <Hidden smUp>
        <AppBar>
          <Toolbar>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography
              id={"subtitle"}
              variant="caption"
              style={{ fontSize: 20, fontWeight: "bold" }}
            >
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
        <Typography variant="h6" noWrap style={{ maxWidth: "100vw" }}>
          {description}
        </Typography>
      </Hidden>
      <Hidden smDown>
        <div>
          <Typography
            variant="caption"
            style={{ fontSize: 20, fontWeight: "bold" }}
          >
            {title}
          </Typography>
          <Typography
            id={"subtitle"}
            variant="h6"
            noWrap
            style={{ maxWidth: "100vw" }}
          >
            {description}
          </Typography>
        </div>
      </Hidden>
    </div>
  );
}
