// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import { configs } from "@etherdata-blockchain/common";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { a11yProps } from "./tabs/horizontal";
import { UIProviderContext } from "../../model/UIProvider";
import qs from "query-string";
import { useRouter } from "next/dist/client/router";
import { useStickyTabBar } from "../../hooks/useStickyTabBar";

type Props = {
  labels: string[];
  top?: number;
  urlKeyName: string;
  pushTo: string;
  initialIndex: number;
};

/**
 * Display sticky tab bar on the screen
 * @param props
 * @constructor
 */
export function StickyTabs(props: Props) {
  const { appBarTitleShow } = React.useContext(UIProviderContext);
  const router = useRouter();
  const [value, setValue] = useStickyTabBar(props.initialIndex);

  const handleChange = React.useCallback(
    async (event: React.SyntheticEvent, newValue: number) => {
      const query = router.query;
      //@ts-ignore
      query[props.urlKeyName as string] = newValue;
      await router.push(
        qs.stringifyUrl({ url: props.pushTo, query: query }),
        undefined,
        { scroll: false }
      );
      setValue(newValue);
    },
    []
  );

  return (
    <Box
      sx={{
        bgcolor: appBarTitleShow ? "background.paper" : undefined,
        width: "100%",
      }}
      style={{
        position: "sticky",
        top: props.top ?? configs.Configurations.appbarHeight,
      }}
    >
      <Tabs
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        style={{
          paddingLeft: configs.Configurations.defaultPadding,
          paddingRight: configs.Configurations.defaultPadding,
        }}
      >
        {props.labels.map((l, i) => (
          <Tab label={l} key={i} {...a11yProps(i)} />
        ))}
      </Tabs>
    </Box>
  );
}
