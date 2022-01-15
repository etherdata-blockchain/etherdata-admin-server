import {
  AppBar,
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  Fade,
  Hidden,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Error, ExitToApp } from "@mui/icons-material";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import React from "react";
import Spacer from "./Spacer";
import { UIProviderContext } from "../../pages/model/UIProvider";
import SearchBar from "./SearchBar";
import { Configurations } from "../../internal/const/configurations";
import { realmApp } from "../../pages/_app";
import ETDProvider from "../../pages/model/ETDProvider";
import DeviceProvider from "../../pages/model/DeviceProvider";
import MenuIcon from "@mui/icons-material/Menu";
import { PendingJobButton } from "../pendingJob/PendingJobButton";

export interface Menu {
  title: string;
  icon: JSX.Element;
  link: string;
}

interface Props {
  children?: any;
  menus: Menu[];
}

/**
 * Default layout for the app. Including a sidebar, a appbar,
 * and will automatically fit different screen size
 * @param {any} props Props
 * @constructor
 */
export default function Layout(props: Props) {
  const { children, menus } = props;
  const router = useRouter();

  React.useEffect(() => {
    if (realmApp.currentUser === null || !realmApp.currentUser.isLoggedIn) {
      router.replace("/");
    }
  }, []);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const {
    drawerOpen,
    setDrawerOpen,
    appBarTitle,
    appBarTitleShow,
    messageDrawerOpen,
    messageDrawerContent,
    setMessageDrawerContent,
    setMessageDrawerOpen,
  } = React.useContext(UIProviderContext);

  React.useEffect(() => {
    const found = menus.findIndex((m) => router.pathname.includes(m.link));
    if (found >= 0) {
      setSelectedIndex(found);
    }
  }, [router.pathname]);

  const listContent = (
    <div>
      {menus.map((m, i) => (
        <Link href={m.link} key={`item-${i}`}>
          <ListItemButton selected={selectedIndex === i} id={m.title}>
            <Tooltip title={m.title}>
              <ListItemIcon>{m.icon}</ListItemIcon>
            </Tooltip>
            <Hidden smUp>
              <ListItemText style={{ color: "white" }}>{m.title}</ListItemText>
            </Hidden>
          </ListItemButton>
        </Link>
      ))}
    </div>
  );

  const tools = (
    <Stack direction={"row"}>
      <Tooltip title={"Bind Device"}>
        <IconButton>
          <Add />
        </IconButton>
      </Tooltip>
      <PendingJobButton />
      <Tooltip title={"Sign Out"}>
        <IconButton
          onClick={async () => {
            await realmApp.currentUser?.logOut();
            await router.replace("/");
          }}
        >
          <ExitToApp />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const appbar = (
    <AppBar elevation={0} position={"fixed"}>
      <Toolbar style={{ marginLeft: Configurations.drawerSize }}>
        <div style={{ width: 400 }}>
          <Collapse
            in={appBarTitleShow}
            timeout={150}
            mountOnEnter
            unmountOnExit
          >
            <Typography style={{ color: "black" }} variant={"h6"}>
              {appBarTitle}
            </Typography>
          </Collapse>
          <Fade in={!appBarTitleShow}>
            <Typography
              style={{ color: "black", position: "absolute", top: 15 }}
              variant={"h6"}
            >
              {Configurations.title}
            </Typography>
          </Fade>
        </div>
        <Divider
          orientation={"vertical"}
          style={{ marginRight: 10, height: 35 }}
        />
        <SearchBar />
        <Box sx={{ flexGrow: 1 }} />
        {tools}
      </Toolbar>
    </AppBar>
  );

  const mobileAppbar = (
    <AppBar elevation={0} position={"fixed"}>
      <Toolbar>
        <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
          <MenuIcon />
        </IconButton>
        <Typography style={{ color: "black" }} variant={"h6"}>
          {appBarTitle}
        </Typography>
        <Divider
          orientation={"vertical"}
          style={{ marginRight: 10, height: 35 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        {tools}
      </Toolbar>
    </AppBar>
  );

  if (router.pathname === "/") {
    return <div>{children}</div>;
  }

  if (realmApp.currentUser === null) {
    return <div />;
  }

  return (
    <DeviceProvider>
      <ETDProvider>
        <div>
          {/*Left Desktop toolbar*/}
          <Hidden only={["xs"]}>
            {appbar}
            <Drawer variant="permanent">
              <List
                style={{
                  width: Configurations.drawerSize,
                  overflowX: "hidden",
                }}
              >
                {listContent}
              </List>
            </Drawer>
          </Hidden>
          {/*End left desktop toolbar*/}
          {/*Start mobile toolbar*/}
          <Hidden only={["sm", "md", "lg", "xl"]}>
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
              }}
            >
              <List style={{ overflowX: "hidden", width: 200 }}>
                {listContent}
              </List>
            </Drawer>
          </Hidden>
          {/*End mobile toolbar*/}
          {/*Message panel*/}
          <Drawer
            anchor={"right"}
            open={messageDrawerOpen}
            onClose={() => {
              setMessageDrawerOpen(false);
              setMessageDrawerContent(undefined);
            }}
          >
            {messageDrawerContent}
          </Drawer>
          {/*Message panel end*/}
          {/*Start desktop main*/}
          <Hidden only={["xs"]}>
            {/** Desktop**/}
            <main
              style={{
                marginLeft: Configurations.drawerSize,
                marginTop: Configurations.appbarHeight,
              }}
            >
              {children}
            </main>
          </Hidden>
          {/*End desktop main*/}
          {/*Start mobile main*/}
          <Hidden only={["sm", "md", "lg", "xl"]}>
            {/** Mobile**/}
            {mobileAppbar}
            <Spacer height={70} />
            <main
              style={{ paddingLeft: 30, paddingRight: 30, paddingBottom: 30 }}
            >
              {children}
            </main>
          </Hidden>
          {/*End mobile main*/}
        </div>
      </ETDProvider>
    </DeviceProvider>
  );
}
