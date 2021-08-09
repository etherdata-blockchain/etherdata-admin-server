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
import { IDevice } from "../../server/schema/device";
import { realmApp } from "../_app";
import { UIProviderContext } from "../model/UIProvider";
import { DeviceAction } from "../../components/device/deviceAction";
import { DeviceContext } from "../model/DeviceProvider";
import ETDProvider, { ETDContext } from "../model/ETDProvider";
import StorageIcon from "@material-ui/icons/Storage";

type Props = {};

export default function Index(props: Props) {
  const { loadingData, devices, filterKeyword } =
    React.useContext(DeviceContext);

  const { history } = React.useContext(ETDContext);

  return (
    <div>
      <PageHeader
        title={"Devices"}
        description={"Manage all online devices here"}
      />
      <Divider />
      <Spacer height={20} />

      <Grid container spacing={4}>
        <Grid item md={4}>
          <LargeDataCard
            icon={<StorageIcon />}
            title={`${history?.latestBlockNumber ?? 0}`}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Number Of Blocks"}
            className={style.detailDataCard}
          />
        </Grid>
        <Grid item md={8}>
          <LargeDataCard
            icon={<ComputerIcon />}
            title={`${devices.filter((d) => d.isOnline).length} / ${
              devices.length
            }`}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Active Devices"}
            className={style.detailDataCard}
          />
        </Grid>
        <Grid item md={12}>
          <ResponsiveCard
            title={"Devices"}
            className={styles.deviceTable}
            action={<DeviceAction />}
          >
            <DeviceTable
              devices={
                filterKeyword.length > 0
                  ? devices.filter((d) => d.id.includes(filterKeyword))
                  : devices
              }
              loading={loadingData}
            />
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
