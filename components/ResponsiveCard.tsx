import { CardContent, Hidden, Paper } from "@material-ui/core";
import React from "react";

export default function ResponsiveCard({
  children,
  className,
}: {
  children: any;
  className?: any;
}) {
  return (
    <div>
      <Hidden mdUp>{children}</Hidden>
      <Hidden only={["xs"]}>
        <Paper className={className}>
          <CardContent>{children}</CardContent>
        </Paper>
      </Hidden>
    </div>
  );
}
