// @flow
import * as React from "react";
import { Divider, Grid } from "@mui/material";
import styles from "../../styles/Device.module.css";
import style from "../../styles/Device.module.css";
import ResponsiveCard from "../../components/ResponsiveCard";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import ComputerIcon from "@material-ui/icons/Computer";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import { DeviceTable } from "../../components/device/deviceTable";
import { DeviceAction } from "../../components/device/deviceAction";
import { DeviceContext } from "../model/DeviceProvider";
import { ETDContext } from "../model/ETDProvider";
import StorageIcon from "@material-ui/icons/Storage";

type Props = {};

export default function Index(props: Props) {
  const {
    loadingData,
    devices,
    filterKeyword,
    currentPageNumber,
    totalPageNumber,
    totalNumDevices,
    totalNumOnlineDevices,
    handlePageChange,
    numPerPage,
  } = React.useContext(DeviceContext);

  const { history } = React.useContext(ETDContext);

  return (
    <div>
      <PageHeader
        title={"Devices"}
        description={"Manage all online device here"}
      />
      <Divider />
      <Spacer height={20} />

      <Grid container spacing={4}>
        <Grid item md={4} xs={6}>
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
        <Grid item md={8} xs={6}>
          <LargeDataCard
            icon={<ComputerIcon />}
            title={`${totalNumOnlineDevices} / ${totalNumDevices}`}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Active Devices"}
            className={style.detailDataCard}
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <ResponsiveCard
            title={"Devices"}
            className={styles.deviceTable}
            action={<DeviceAction />}
          >
            <DeviceTable
              numPerPage={numPerPage}
              currentPageNumber={currentPageNumber}
              totalPageNumber={totalPageNumber}
              onPageChanged={handlePageChange}
              totalNumRows={totalNumDevices}
              devices={devices}
              loading={loadingData}
            />
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
