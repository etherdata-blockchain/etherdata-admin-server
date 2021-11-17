// @flow
import * as React from "react";
import { Avatar, Card, Grid, Stack, Typography } from "@mui/material";

type Props = {
  className?: string;
  backgroundColor?: string;
  items: { title: string; subtitle: string; icon: JSX.Element }[];
  iconColor?: string;
  iconBackgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
};

export function GridDataCard({
  className,
  backgroundColor,
  items,
  iconColor,
  iconBackgroundColor,
  titleColor,
  subtitleColor,
}: Props) {
  return (
    <Card className={className} style={{ backgroundColor: backgroundColor }}>
      <Grid
        container
        alignItems={"center"}
        justifyContent={"center"}
        justifyItems={"center"}
        width={"100%"}
        height={"100%"}
        padding={1}
      >
        {items.map((item) => (
          <Grid key={item.subtitle} item xs={6}>
            <div>
              <Stack
                direction={"row"}
                spacing={3}
                alignItems={"center"}
                padding={1}
              >
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
                    marginLeft: 10,
                  }}
                >
                  {item.icon}
                </Avatar>
                <Stack direction={"column"}>
                  <Typography style={{ color: titleColor }}>
                    {item.title}
                  </Typography>
                  <Typography style={{ color: subtitleColor }}>
                    {item.subtitle}
                  </Typography>
                </Stack>
              </Stack>
            </div>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
