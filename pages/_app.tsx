import type { AppProps } from "next/app";
import Layout, { Menu } from "../components/layout";
import HomeIcon from "@material-ui/icons/Home";
import { createTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import ReceiptIcon from "@material-ui/icons/Receipt";
import "../styles/globals.css";
import UIProviderProvider from "./model/UIProvider";
import DevicesOtherIcon from "@material-ui/icons/DevicesOther";
import React from "react";
import PersonIcon from "@material-ui/icons/Person";
import ETDProvider from "./model/ETDProvider";
import * as Realm from "realm-web";
import DeviceProvider from "./model/DeviceProvider";
import PieChartIcon from "@material-ui/icons/PieChart";

export const realmApp = new Realm.App({ id: process.env.NEXT_PUBLIC_APP_ID! });
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

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  const menus = [
    {
      title: "Home",
      icon: <HomeIcon />,
      link: "/home",
    },
    {
      title: "Device",
      icon: <DevicesOtherIcon />,
      link: "/device",
    },
    {
      title: "Transaction",
      icon: <ReceiptIcon />,
      link: "/transaction",
    },
    {
      title: "User",
      icon: <PersonIcon />,
      link: "/user",
    },
    {
      title: "Chart",
      icon: <PieChartIcon />,
      link: "/chart",
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <UIProviderProvider>
        <Layout menus={menus}>
          <CssBaseline />
          <Component {...pageProps} />
        </Layout>
      </UIProviderProvider>
    </ThemeProvider>
  );
}
export default MyApp;
