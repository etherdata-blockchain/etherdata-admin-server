// @flow
import * as React from "react";
import { Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/Device.module.css";
import ResponsiveCard from "../../components/ResponsiveCard";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";

type Props = {};

export default function Index(props: Props) {
  return (
    <div>
      <PageHeader title={"Devices"} description={"Default message"} />
      <Divider />
      <Spacer height={20} />

      <Grid container spacing={4}>
        <Grid item md={4}>
          <ResponsiveCard title={"Active devices"}>
            <Typography>20/20</Typography>
          </ResponsiveCard>
        </Grid>
        <Grid item md={8}>
          <ResponsiveCard title={"Active Device History"}>
            <Typography>20/20</Typography>
          </ResponsiveCard>
        </Grid>
        <Grid item md={12}>
          <ResponsiveCard title={"Devices"} className={styles.deviceTable}>
            <Typography>20/20</Typography>
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
