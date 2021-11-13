import React from "react";
import { Snackbar } from "@mui/material";

interface UIProviderInterface {
  drawerOpen: boolean;
  appBarTitle?: string;
  appBarTitleShow: boolean;

  setDrawerOpen(v: boolean): void;

  showSnackBarMessage(v: string): void;

  showAppBarTitle(v: string): void;

  hideAppBarTitle(): void;
}

//@ts-ignore
export const UIProviderContext = React.createContext<UIProviderInterface>({});

export default function UIProviderProvider(props: any) {
  const { children } = props;
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Title
  const [appBarTitleShow, setAppBarTitleOpen] = React.useState(false);
  const [appBarTitle, setAppbarTitle] = React.useState<string>();

  const [snackBarShow, setSnackBarShow] = React.useState(false);
  const [snackBarMessage, setSnackBarMessage] = React.useState<string>();

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
    showAppBarTitle,
    hideAppBarTitle,
    appBarTitle,
    appBarTitleShow,
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
