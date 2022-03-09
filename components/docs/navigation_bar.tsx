// @flow
import * as React from "react";
import { Breadcrumbs, Link } from "@mui/material";
import { configs } from "@etherdata-blockchain/common";

type Props = {
  links: { title: string }[];
};

/**
 * Navigation bar used in documentation page
 * @param props
 * @constructor
 */
export function NavigationBar(props: Props) {
  return (
    <Breadcrumbs>
      <Link
        underline="hover"
        color="inherit"
        href={configs.Routes.documentation}
      >
        Documentation
      </Link>
      {props.links.map((l) => (
        <Link color="inherit">{l.title}</Link>
      ))}
    </Breadcrumbs>
  );
}
