import type { AppProps } from "next/app";
import Layout from "../components/common/layout";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "../styles/globals.css";
import UIProviderProvider from "../model/UIProvider";
import React from "react";
import * as Realm from "realm-web";
import { Home, Person, PieChart, Settings } from "@mui/icons-material";
import NextNprogress from "nextjs-progressbar";
import DownloadingIcon from "@mui/icons-material/Downloading";
import BrowserUpdatedIcon from "@mui/icons-material/BrowserUpdated";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { configs } from "@etherdata-blockchain/common";

const Routes = configs.Routes;

// Setup realm for login
export const realmApp = new Realm.App({
  id: configs.Environments.ClientSideEnvironments.NEXT_PUBLIC_APP_ID,
});
const darkTheme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "white",
          boxShadow:
            "rgb(50 50 93 / 3%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "white" + "",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#354d57",
        },
      },
    },
  },
  palette: {
    mode: "light",
    background: {
      default: "#F7F9FC",
    },
    primary: {
      main: "#c7007e",
    },
  },
});

/**
 * Main entrypoint for app
 * @param {any} props props
 * @constructor
 */
function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  const menus = [
    {
      title: "Home",
      icon: <Home />,
      link: "/home",
    },
    {
      title: "User",
      icon: <Person />,
      link: "/user",
    },
    {
      title: "Chart",
      icon: <PieChart />,
      link: "/chart",
    },
    {
      title: "Installation",
      icon: <DownloadingIcon />,
      link: Routes.installation,
    },
    {
      title: "Update Template",
      icon: <BrowserUpdatedIcon />,
      link: Routes.update,
    },
    {
      title: "Settings",
      icon: <Settings />,
      link: Routes.settings,
    },
    {
      title: "Documentation",
      icon: <MenuBookIcon />,
      link: Routes.documentation,
    },
  ];

  return (
    <div>
      <NextNprogress
        color="#29D"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
      />
      <ThemeProvider theme={darkTheme}>
        <UIProviderProvider>
          <Layout menus={menus}>
            <CssBaseline />
            <Component {...pageProps} />
          </Layout>
        </UIProviderProvider>
      </ThemeProvider>
    </div>
  );
}

export default MyApp;
