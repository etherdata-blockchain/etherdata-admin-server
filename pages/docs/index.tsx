// @flow
import * as React from "react";
import { Card, CardActionArea, Stack, Typography } from "@mui/material";
import { MenuBook } from "@mui/icons-material";
import { configs } from "@etherdata-blockchain/common";
import { useRouter } from "next/router";
import PageHeader from "../../components/common/PageHeader";
import Spacer from "../../components/common/Spacer";

const availableDocuments = [
  {
    icon: <MenuBook style={{ fontSize: 80 }} />,
    title: "API Documentation",
    route: configs.Routes.apiDocumentation,
  },
];

/**
 * Documentation home page
 * @constructor
 */
export default function Index() {
  const router = useRouter();
  return (
    <div>
      <Spacer height={10} />
      <PageHeader title={"Documentation"} description={""} />
      <Stack
        direction={"row"}
        width={"100%"}
        height={`calc(100vh - ${configs.Configurations.appbarHeight + 60}px)`}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {availableDocuments.map((d) => (
          <Card key={d.title}>
            <CardActionArea onClick={async () => await router.push(d.route)}>
              <Stack p={10} alignItems={"center"}>
                {d.icon}
                <Typography variant={"h5"}>{d.title}</Typography>
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
