// @flow
import * as React from "react";
import { Divider, Grid, Typography } from "@material-ui/core";
import styles from "../../styles/Device.module.css";
import ResponsiveCard from "../../components/ResponsiveCard";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import ComputerIcon from "@material-ui/icons/Computer";
import style from "../../styles/Device.module.css";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import { DeviceTable } from "../../components/device/deviceTable";

type Props = {};

export default function Index(props: Props) {
  return (
    <div>
      <PageHeader title={"Devices"} description={"Default message"} />
      <Divider />
      <Spacer height={20} />

      <Grid container spacing={4}>
        <Grid item md={4}>
          <LargeDataCard
            icon={<ComputerIcon />}
            title={"12345"}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Current Block Number"}
            className={style.detailDataCard}
          />
        </Grid>
        <Grid item md={8}>
          <LargeDataCard
            icon={<ComputerIcon />}
            title={"10/30"}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Active Devices"}
            className={style.detailDataCard}
          />
        </Grid>
        <Grid item md={12}>
          <ResponsiveCard title={"Devices"} className={styles.deviceTable}>
            <DeviceTable />
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
