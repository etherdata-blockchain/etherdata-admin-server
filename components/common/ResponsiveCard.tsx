import {
  Box,
  Card,
  CardContent,
  Divider,
  Hidden,
  Typography,
} from "@mui/material";
import React from "react";

/**
 * Will display a card component by current screen width.
 * If screen width belows xs break point, will not
 * display a card.
 * @param children
 * @param className
 * @param title
 * @param subtitle
 * @param style
 * @param action
 * @param containerStyle
 * @constructor
 */
export default function ResponsiveCard({
  children,
  className,
  title,
  subtitle,
  style,
  action,
  containerStyle,
}: {
  children: any;
  className?: any;
  title?: string | JSX.Element;
  subtitle?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  action?: JSX.Element;
}) {
  return (
    <div style={containerStyle}>
      <Hidden only={["sm", "md", "lg", "xl"]}>{children}</Hidden>
      <Hidden only={["xs"]}>
        <Card className={className} style={style}>
          <CardContent style={{ height: "100%" }}>
            <Box p={2}>
              <Typography variant={"h5"} fontWeight={"bold"} fontSize={20}>
                {title}
              </Typography>
            </Box>
            {title && <Divider />}
            {children}
          </CardContent>
        </Card>
      </Hidden>
    </div>
  );
}
