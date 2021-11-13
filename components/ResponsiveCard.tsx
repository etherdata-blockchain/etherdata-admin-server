import {
  Card,
  CardContent,
  CardHeader,
  Hidden,
  Typography,
} from "@mui/material";
import React from "react";

export default function ResponsiveCard({
  children,
  className,
  title,
  subtitle,
  style,
  action,
}: {
  children: any;
  className?: any;
  title?: string | JSX.Element;
  subtitle?: string;
  style?: React.CSSProperties;
  action?: JSX.Element;
}) {
  return (
    <div>
      <Hidden mdUp>{children}</Hidden>
      <Hidden only={["xs"]}>
        <Card className={className} style={style}>
          {title && (
            <CardHeader
              title={<Typography variant={"subtitle1"}>{title}</Typography>}
              subheader={
                <Typography variant={"caption"}>{subtitle}</Typography>
              }
              action={action}
            />
          )}

          <CardContent style={{ height: "100%" }}>{children}</CardContent>
        </Card>
      </Hidden>
    </div>
  );
}
