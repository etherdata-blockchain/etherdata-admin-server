// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { Grid } from "@mui/material";
import ResponsiveCard from "../../components/ResponsiveCard";
import Spacer from "../../components/Spacer";
import { GetServerSideProps } from "next";
import {
  DeviceRegistrationPlugin,
  VersionInfo,
} from "../../server/plugin/plugins/deviceRegistrationPlugin";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import randomColor from "randomcolor";

type Props = {
  adminVersions: VersionInfo[];
  nodeVersions: VersionInfo[];
  colors: string[];
};

export default function Transaction({
  adminVersions,
  nodeVersions,
  colors,
}: Props) {
  return (
    <div>
      <PageHeader title={"Chart"} description={"List of charts"} />
      <Spacer height={20} />
      <Grid container spacing={5}>
        <Grid item md={6}>
          <ResponsiveCard style={{ height: 600 }} title={"Admin versions"}>
            <ResponsiveContainer width="100%" height="80%">
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
        <Grid item md={6}>
          <ResponsiveCard style={{ height: 600 }} title={"Node versions"}>
            <ResponsiveContainer width="100%" height="80%">
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  let plugin = new DeviceRegistrationPlugin();
  let adminVersions = await plugin.getListOfAdminVersions();
  let nodeVersions = await plugin.getListOfNodeVersion();
  let size = Math.max(adminVersions.length, nodeVersions.length);
  let colors = randomColor({ count: size });
  return {
    props: {
      adminVersions,
      nodeVersions,
      colors,
    },
  };
};
