// @flow
import * as React from "react";
import PageHeader from "../../components/common/PageHeader";
import { Grid } from "@mui/material";
import ResponsiveCard from "../../components/common/ResponsiveCard";
import Spacer from "../../components/common/Spacer";
import styles from "../../styles/Home.module.css";
import { DurationSelectorBtn } from "../../components/home/DurationSelectorBtn";
import { BlockTimeHistoryDisplay } from "../../components/home/blockTimeHistoryDisplay";
import { BlockMinerDisplay } from "../../components/home/blockMinerDisplay";
import { TransactionDisplay } from "../../components/home/transactionDisplay";
import { DifficultyHistoryDisplay } from "../../components/home/difficultyHistoryDisplay";
import { ETDContext } from "../model/ETDProvider";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import style from "../../styles/Device.module.css";
import { DeviceContext } from "../model/DeviceProvider";
import { DefaultPaginationResult } from "../../internal/const/defaultValues";
import { PaddingBox } from "../../components/common/PaddingBox";
import { GetServerSideProps } from "next";
import { configs, utils } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { Apps, Functions, HourglassBottom, Storage } from "@mui/icons-material";

type Props = {
  onlineCount: number;
  totalCount: number;
};

/**
 * Home page
 * @param props
 * @constructor
 */
export default function Index(props: Props) {
  const { history } = React.useContext(ETDContext);
  const { realtimeStatus, hasReceivedData } = React.useContext(DeviceContext);
  const {} = DefaultPaginationResult;

  const blockNumber = history?.latestBlockNumber;

  const difficulty = history?.latestDifficulty;
  const blockTime = history?.latestAvgBlockTime;
  const networkHashRate = difficulty && blockTime ? difficulty / blockTime : 0;
  const onlineCount = hasReceivedData
    ? realtimeStatus.onlineCount
    : props.onlineCount;
  const totalCount = hasReceivedData
    ? realtimeStatus.totalCount
    : props.totalCount;

  return (
    <div>
      <PageHeader
        title={"Dashboard"}
        description={`Version ${configs.Environments.ClientSideEnvironments.NEXT_PUBLIC_VERSION}`}
      />
      <Spacer height={10} />
      <PaddingBox>
        <Grid container spacing={3}>
          <Grid item md={3} xs={6}>
            <LargeDataCard
              icon={<Storage />}
              title={`${onlineCount}/${totalCount}`}
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
              icon={<Apps />}
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
              icon={<HourglassBottom />}
              title={`${utils.abbreviateNumber(difficulty ?? 0)}`}
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
              icon={<Functions />}
              title={`${utils.abbreviateNumber(networkHashRate)}`}
              color={"#03cafc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#05b6e3"}
              subtitle={"Network HashRate"}
              className={style.dataCard}
            />
          </Grid>
          {/* Second Row*/}
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
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const deviceRegistrationService = new dbServices.DeviceRegistrationService();
  const storageService = new dbServices.StorageManagementService();

  const data: Props = {
    onlineCount: await deviceRegistrationService.getOnlineDevicesCount(),
    totalCount: await storageService.count(),
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
