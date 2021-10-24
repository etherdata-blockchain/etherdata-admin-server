// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { Grid, Typography } from "@mui/material";
import ResponsiveCard from "../../components/ResponsiveCard";
import Spacer from "../../components/Spacer";
import styles from "../../styles/Home.module.css";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { DurationSelectorBtn } from "../../components/home/DurationSelectorBtn";
import { BlockTimeHistoryDisplay } from "../../components/home/blockTimeHistoryDisplay";
import { BlockMinerDisplay } from "../../components/home/blockMinerDisplay";
import { TransactionDisplay } from "../../components/home/transactionDisplay";
import { DifficultyHistoryDisplay } from "../../components/home/difficultyHistoryDisplay";
import { ETDContext } from "../model/ETDProvider";
import { abbreviateNumber } from "../../utils/valueFormatter";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import style from "../../styles/Device.module.css";

import StorageIcon from "@material-ui/icons/Storage";
import ComputerIcon from "@material-ui/icons/Computer";
import AppsIcon from "@material-ui/icons/Apps";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import FunctionsIcon from "@material-ui/icons/Functions";
import { DeviceContext } from "../model/DeviceProvider";

type Props = {};

export default function Index(props: Props) {
  const { history } = React.useContext(ETDContext);
  const { devices, totalNumOnlineDevices, totalNumDevices } =
    React.useContext(DeviceContext);
  const blockNumber = history?.latestBlockNumber;

  const difficulty = history?.latestDifficulty;
  const blockTime = history?.latestAvgBlockTime;
  const networkHashRate = difficulty && blockTime ? difficulty / blockTime : 0;
  return (
    <div>
      <PageHeader title={"Dashboard"} description={"Default Message"} />
      <Spacer height={10} />
      <Grid container spacing={3}>
        <Grid item md={3} xs={6}>
          <LargeDataCard
            icon={<StorageIcon />}
            title={`${totalNumOnlineDevices}/${totalNumDevices}`}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Active Nodes"}
            className={style.dataCard}
          />
        </Grid>
        <Grid item md={3} xs={6}>
          <LargeDataCard
            icon={<AppsIcon />}
            title={`${blockNumber}`}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Number of blocks"}
            className={style.dataCard}
          />
        </Grid>
        <Grid item md={3} xs={6}>
          <LargeDataCard
            icon={<HourglassEmptyIcon />}
            title={`${abbreviateNumber(difficulty ?? 0)}`}
            color={"#03cafc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#05b6e3"}
            subtitle={"Difficulty"}
            className={style.dataCard}
          />
        </Grid>

        <Grid item md={3} xs={6}>
          <LargeDataCard
            icon={<FunctionsIcon />}
            title={`${abbreviateNumber(networkHashRate)}`}
            color={"#03cafc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#05b6e3"}
            subtitle={"Network HashRate"}
            className={style.dataCard}
          />
        </Grid>
        {/*Second Row*/}
        <Grid item md={8} xs={12}>
          <ResponsiveCard
            title={"Block Time"}
            subtitle={"History Block Time"}
            action={<DurationSelectorBtn />}
            className={styles.graphCard}
          >
            <BlockTimeHistoryDisplay />
          </ResponsiveCard>
        </Grid>

        <Grid item md={4} xs={12}>
          <ResponsiveCard
            title={"Block Miners"}
            subtitle={"Block Miners"}
            action={<DurationSelectorBtn />}
            className={styles.graphCard}
          >
            <BlockMinerDisplay />
          </ResponsiveCard>
        </Grid>

        <Grid item md={4} xs={12}>
          <ResponsiveCard
            title={"Transaction"}
            subtitle={"Transaction"}
            action={<DurationSelectorBtn />}
            className={styles.graphCard}
          >
            <TransactionDisplay />
          </ResponsiveCard>
        </Grid>

        <Grid item md={8} xs={12}>
          <ResponsiveCard
            title={"Difficulty"}
            subtitle={"Block Miners"}
            className={styles.graphCard}
          >
            <DifficultyHistoryDisplay />
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
