// @flow
import * as React from "react";
import { SwaggerContentType } from "../../internal/handlers/swagger_api_handler";
import {
  Chip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { configs } from "@etherdata-blockchain/common";
import { useRouter } from "next/router";
import { debounce, throttle } from "throttle-debounce";

type Props = {
  title: string;
  contents: SwaggerContentType[];
  currentHash: string;
  scrollIntoView: boolean;
};

const colorMap: { [key: string]: string } = {
  GET: "info",
  POST: "warning",
  PATCH: "success",
  DELETE: "error",
  PUT: "warning",
};

/**
 * TOC item cell
 * @param title
 * @param contents
 * @param currentHash
 * @param scrollIntoView
 * @constructor
 */
export function TableOfContentItem({
  title,
  contents,
  currentHash,
  scrollIntoView,
}: Props) {
  const router = useRouter();
  const ref = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    if (scrollIntoView) {
      ref.current?.scrollIntoView();
    }
  }, [scrollIntoView, ref]);

  return (
    <div>
      <ListSubheader ref={ref}>{title}</ListSubheader>
      {contents.map((p) => (
        <ListItemButton
          key={p.link}
          style={{ marginBottom: 2 }}
          onClick={async () => {
            await router.push(`${configs.Routes.apiDocumentation}${p.link}`);
          }}
          selected={currentHash === p.link}
        >
          <ListItemIcon style={{ width: 90, alignItems: "start" }}>
            <Chip
              label={p.method}
              size={"small"}
              style={{ margin: 5 }}
              color={colorMap[p.method] as any}
            />
          </ListItemIcon>
          <ListItemText
            primary={<Typography>{p.name}</Typography>}
            secondary={
              <Typography
                style={{ wordBreak: "break-word" }}
                variant={"subtitle2"}
              >
                {p.path}
              </Typography>
            }
          />
        </ListItemButton>
      ))}
    </div>
  );
}
