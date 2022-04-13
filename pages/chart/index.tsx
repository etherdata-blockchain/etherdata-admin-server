// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import { Grid, List } from "@mui/material";
import ResponsiveCard from "../../components/common/ResponsiveCard";
import Spacer from "../../components/common/Spacer";
import { GetServerSideProps } from "next";
import { dbServices } from "@etherdata-blockchain/services";
import randomColor from "randomcolor";
import { VersionInfo } from "@etherdata-blockchain/services/src/mongodb/services/device/device_registration_service";
import { LegendItem } from "../../components/chart/legendItem";

const {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} = require("recharts");

type Props = {
  adminVersions: VersionInfo[];
  nodeVersions: VersionInfo[];
  colors: string[];
};

const cardHeight = 480;

// eslint-disable-next-line require-jsdoc
export default function Chart({ adminVersions, nodeVersions, colors }: Props) {
  return (
    <div>
      <PageHeader title={"Chart"} description={"List of charts"} />
      <Spacer height={20} />
      <Grid container spacing={5}>
        <Grid item md={8} sm={12}>
          <ResponsiveCard title={"Admin versions"}>
            <ResponsiveContainer width="100%" height={cardHeight}>
              <PieChart>
                <Pie
                  dataKey={"count"}
                  data={adminVersions.map((a) => {
                    return { ...a, name: `Admin version: ${a.version}` };
                  })}
                  innerRadius={"50%"}
                  label
                >
                  {adminVersions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ResponsiveCard>
        </Grid>
        <Grid item md={4} sm={12}>
          <ResponsiveCard title={"Admin distributions"}>
            <List style={{ height: cardHeight }}>
              {adminVersions.map((c, i) => (
                <LegendItem
                  color={colors[i % colors.length]}
                  title={`${adminVersions[i].version}`}
                  count={adminVersions[i].count}
                  size={22}
                />
              ))}
            </List>
          </ResponsiveCard>
        </Grid>
        <Grid item md={4} sm={12}>
          <ResponsiveCard title={"Node Version distributions"}>
            <List style={{ height: cardHeight }}>
              {nodeVersions.map((c, i) => (
                <LegendItem
                  color={colors[i % colors.length]}
                  title={`${nodeVersions[i].version}`}
                  count={nodeVersions[i].count}
                  size={22}
                />
              ))}
            </List>
          </ResponsiveCard>
        </Grid>
        <Grid item md={8} sm={12}>
          <ResponsiveCard title={"Node versions"}>
            <ResponsiveContainer width="100%" height={cardHeight}>
              <PieChart>
                <Pie
                  dataKey={"count"}
                  data={nodeVersions.map((a) => {
                    return { ...a, name: `Node version: ${a.version}` };
                  })}
                  innerRadius={"50%"}
                  label
                >
                  {nodeVersions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ResponsiveCard>
        </Grid>
      </Grid>

      <Spacer height={20} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const deviceRegistrationService = new dbServices.DeviceRegistrationService();
  const adminVersions =
    await deviceRegistrationService.getListOfAdminVersions();
  const nodeVersions = await deviceRegistrationService.getListOfNodeVersion();
  const size = Math.max(adminVersions.length, nodeVersions.length);
  const colors = randomColor({ count: size });
  return {
    props: {
      adminVersions,
      nodeVersions,
      colors,
    },
  };
};
