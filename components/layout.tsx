import { ListItemText } from "@material-ui/core";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
  Hidden,
  ListItemButton,
  IconButton,
} from "@material-ui/core";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import Spacer from "./Spacer";
import { UIProviderContext } from "../pages/model/UIProvider";

export interface Menu {
  title: string;
  icon: JSX.Element;
  link: string;
}

interface Props {
  children?: any;
  menus: Menu[];
}

const drawerWidth = 60;

export default function Layout(props: Props) {
  const { children, menus } = props;
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { drawerOpen, setDrawerOpen } = React.useContext(UIProviderContext);

  React.useEffect(() => {
    if (router.pathname !== "/") {
      let found = menus.findIndex(
        (m) => router.pathname.includes(m.link) && m.link !== "/"
      );
      if (found) {
        setSelectedIndex(found);
      }
    } else {
      setSelectedIndex(0);
    }
  }, [router.pathname]);

  const listContent = (
    <div>
      {menus.map((m, i) => (
        <Link href={m.link} key={`item-${i}`}>
          <ListItemButton selected={selectedIndex === i}>
            <Tooltip title={m.title}>
              <ListItemIcon>{m.icon}</ListItemIcon>
            </Tooltip>
            <Hidden smUp>
              <ListItemText>{m.title}</ListItemText>
            </Hidden>
          </ListItemButton>
        </Link>
      ))}
    </div>
  );

  return (
    <div>
      <Hidden only={["xs"]}>
        {/**Desktop**/}
        <Drawer variant="permanent">
          <List style={{ width: drawerWidth, overflowX: "hidden" }}>
            {listContent}
          </List>
        </Drawer>
      </Hidden>
      <Hidden mdUp>
        {/**mobile**/}
        <Drawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
          }}
        >
          <List style={{ overflowX: "hidden", width: 200 }}>{listContent}</List>
        </Drawer>
      </Hidden>
      <Hidden only={["xs"]}>
        {/**Desktop**/}
        <main style={{ marginLeft: drawerWidth, padding: 30 }}>{children}</main>
      </Hidden>
      <Hidden smUp>
        {/**Mobile**/}
        <Spacer height={70} />
        <main style={{ paddingLeft: 30, paddingRight: 30, paddingBottom: 30 }}>
          {children}
        </main>
      </Hidden>
    </div>
  );
}
