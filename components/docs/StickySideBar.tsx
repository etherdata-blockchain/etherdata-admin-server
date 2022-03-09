// @flow
import * as React from "react";
import ResponsiveCard from "../common/ResponsiveCard";
import { configs } from "@etherdata-blockchain/common";
import { Configurations } from "@etherdata-blockchain/common/dist/configs";
import { List } from "@mui/material";
import { SwaggerAPITableOfContentType } from "../../internal/handlers/swagger_api_handler";
import { debounce } from "throttle-debounce";
import { useRouter } from "next/router";
import { TableOfContentItem } from "./table_of_content_item";

const colorMap: { [key: string]: string } = {
  GET: "info",
  POST: "warning",
  PATCH: "success",
  DELETE: "error",
  PUT: "warning",
};

type Props = {
  toc: SwaggerAPITableOfContentType;
};

/**
 * Sticky navigation bar
 * @param toc
 * @constructor
 */
export function StickySideBar({ toc }: Props) {
  const router = useRouter();
  const [currentHash, setCurrentHash] = React.useState<string>(
    window.location.hash
  );
  const [currentIndex, setCurrentIndex] = React.useState<number>();

  const mapWithLinks = React.useMemo(() => {
    const map: { [key: string]: string[] } = {};
    for (const [key, value] of Object.entries(toc)) {
      map[key] = value.map((v) => v.link);
    }
    return map;
  }, []);

  React.useEffect(() => {
    // scroll left sidebar to the targeted position
    const handleScroll = debounce(0, () => {
      const nextHash = window.location.hash;
      if (nextHash !== currentHash) {
        setCurrentHash(nextHash);
        const foundIndex = Object.entries(mapWithLinks).findIndex(
          ([key, value]) => value.includes(nextHash)
        );
        setCurrentIndex(foundIndex);
      }
    });

    window.addEventListener("scroll", handleScroll, false);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentHash, mapWithLinks]);

  return (
    <ResponsiveCard
      containerStyle={{
        top: configs.Configurations.appbarHeight + 10,
        position: "sticky",
        height: `calc(100vh - ${Configurations.appbarHeight + 30}px)`,
        overflowY: "scroll",
      }}
    >
      <List dense>
        {Object.entries(toc).map(([key, value], index) => (
          <TableOfContentItem
            key={key}
            title={key}
            contents={value}
            currentHash={currentHash}
            scrollIntoView={index === currentIndex}
          />
        ))}
      </List>
    </ResponsiveCard>
  );
}
