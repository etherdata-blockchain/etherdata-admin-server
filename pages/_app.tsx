import type { AppProps } from "next/app";
import Layout from "../components/layout";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "../styles/globals.css";
import UIProviderProvider from "./model/UIProvider";
import React from "react";
import * as Realm from "realm-web";
import {
  DevicesOther,
  Home,
  Person,
  PieChart,
  Receipt,
} from "@mui/icons-material";
import NextNprogress from "nextjs-progressbar";

// Setup realm for login
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
      icon: <Home />,
      link: "/home",
    },
    {
      title: "Device",
      icon: <DevicesOther />,
      link: "/device",
    },
    {
      title: "Transaction",
      icon: <Receipt />,
      link: "/transaction",
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
