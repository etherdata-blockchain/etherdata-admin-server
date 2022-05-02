import React from "react";
import { Snackbar } from "@mui/material";

interface UIProviderInterface {
  drawerOpen: boolean;
  /**
   * Right side message draw
   */
  messageDrawerOpen: boolean;
  messageDrawerContent?: React.ReactElement;

  appBarTitle?: string;
  appBarTitleShow: boolean;

  setDrawerOpen(v: boolean): void;

  showSnackBarMessage(v: string): void;

  showAppBarTitle(v: string): void;

  hideAppBarTitle(): void;

  setMessageDrawerOpen(v: boolean): void;

  setMessageDrawerContent(c?: React.ReactElement): void;
}

// @ts-ignore
export const UIProviderContext = React.createContext<UIProviderInterface>({});

/**
 * UI Provider provides an easy way to control the UI components
 * in the layout
 * @param {jsx} props The children of the Provider
 * @constructor
 */
export default function UIProviderProvider(props: any) {
  const { children } = props;
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Title
  const [appBarTitleShow, setAppBarTitleOpen] = React.useState(false);
  const [appBarTitle, setAppbarTitle] = React.useState<string>();

  const [snackBarShow, setSnackBarShow] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState<string>();

  // Message drawer
  const [messageDrawerOpen, setMessageDrawerOpen] =
    React.useState<boolean>(false);
  const [messageDrawerContent, setMessageDrawerContent] =
    React.useState<React.ReactElement>();

  const showSnackBarMessage = React.useCallback((message: string) => {
    setSnackBarShow(true);
    setSnackBarMessage(message);
  }, []);

  const closeSnackBar = React.useCallback(() => {
    setSnackBarShow(false);
    setSnackBarMessage(undefined);
  }, []);

  const showAppBarTitle = React.useCallback((title: string) => {
    setAppbarTitle(title);
    setAppBarTitleOpen(true);
  }, []);

  const hideAppBarTitle = React.useCallback(() => {
    setAppbarTitle(undefined);
    setAppBarTitleOpen(false);
  }, []);

  const value: UIProviderInterface = {
    drawerOpen,
    setDrawerOpen,
    showSnackBarMessage,
    // Appbar title
    showAppBarTitle,
    hideAppBarTitle,
    appBarTitle,
    appBarTitleShow,
    // Message content
    messageDrawerOpen,
    setMessageDrawerContent,
    messageDrawerContent,
    setMessageDrawerOpen,
  };

  return (
    <UIProviderContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackBarShow}
        message={snackBarMessage}
        onClose={() => closeSnackBar()}
        autoHideDuration={5000}
      />
    </UIProviderContext.Provider>
  );
}
