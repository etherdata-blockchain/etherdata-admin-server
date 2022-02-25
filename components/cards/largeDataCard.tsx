// @flow
import * as React from "react";
import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";

type Props = {
  icon: JSX.Element;
  title: string;
  color: string;
  iconColor: string;
  iconBackgroundColor?: string;
  subtitleColor?: string;
  subtitle: string;
  action?: JSX.Element;
  className?: string;
  style?: JSX.Element;
  onClick?: () => void;
};

/**
 * Display a large data card
 * @param title
 * @param subtitle
 * @param action
 * @param icon
 * @param color
 * @param iconColor
 * @param subtitleColor
 * @param iconBackgroundColor
 * @param style
 * @param className
 * @param onClick
 * @constructor
 */
export function LargeDataCard({
  title,
  subtitle,
  action,
  icon,
  color,
  iconColor,
  subtitleColor,
  iconBackgroundColor,
  style,
  className,
  onClick,
}: Props) {
  return (
    <Card
      style={{
        backgroundColor: color,
        cursor: onClick !== undefined ? "pointer" : undefined,
      }}
      className={className}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Avatar
            style={{
              color: iconColor,
              backgroundColor: iconBackgroundColor ?? "#1565c0",
              borderRadius: 10,
              width: 44,
              height: 44,
              fontSize: "1.3rem",
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            {icon}
          </Avatar>

          {action}
        </Stack>
        <Typography
          style={{
            fontSize: "30px",
            color: iconColor,
            fontWeight: "bold",
          }}
        >
          {title}
        </Typography>

        <Typography
          style={{ color: subtitleColor ?? "#90caf9", fontWeight: "bold" }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}
