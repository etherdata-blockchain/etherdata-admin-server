import type { AppProps } from "next/app";
import Layout from "../components/layout";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "../styles/globals.css";
import UIProviderProvider from "./model/UIProvider";
import React from "react";
import * as Realm from "realm-web";
import { Home, Person, PieChart, Receipt } from "@mui/icons-material";
import NextNprogress from "nextjs-progressbar";
import DownloadingIcon from "@mui/icons-material/Downloading";
import { getEnvironments } from "../internal/const/environments";

// Setup realm for login
export const realmApp = new Realm.App({
  id: getEnvironments.NEXT_PUBLIC_APP_ID,
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
        root: {
          backgroundColor: "#667880",
          overflow: "hidden",
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
      title: "Transaction",
      icon: <Receipt />,
      link: "/transaction",
    },
    {
      title: "Chart",
      icon: <PieChart />,
      link: "/chart",
    },
    {
      title: "Installation",
      icon: <DownloadingIcon />,
      link: "/installation",
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
