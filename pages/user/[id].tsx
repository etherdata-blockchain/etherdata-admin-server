import React from "react";
import { GetServerSideProps } from "next";
import moment from "moment";
import axios from "axios";
import {
  PaginatedItems,
  StorageManagementSystemPlugin,
} from "../../server/plugin/plugins/storageManagementSystemPlugin";
import { useRouter } from "next/dist/client/router";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import { Divider, Grid, List, ListItem, ListItemText } from "@mui/material";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Web3 from "web3";
import ResponsiveCard from "../../components/ResponsiveCard";
import { RewardDisplay } from "../../components/user/rewardDisplay";
import { weiToETD } from "../../utils/weiToETD";
import { DeviceTable } from "../../components/device/deviceTable";

interface Props {
  coinbase: string;
  paginatedItems: PaginatedItems;
  rewards: { date: string; reward: number }[];
  user: {
    balance: string;
    transactions: { from: string; value: string; time: string }[];
  };
}

export default function ({ rewards, user, paginatedItems, coinbase }: Props) {
  const { totalPage, totalDevices, deviceIds } = paginatedItems;
  const router = useRouter();
  console.log(rewards);

  return (
    <div>
      <PageHeader title={"User"} description={coinbase} />
      <Spacer height={20} />
      <Grid container spacing={5}>
        <Grid item md={6} xs={12}>
          <LargeDataCard
            icon={<AccountBalanceWalletIcon />}
            title={"Balance"}
            color={"#7ed1e6"}
            iconColor={"#ffffff"}
            subtitle={`${weiToETD(user.balance)} ETD`}
            subtitleColor={"white"}
          />
          <Spacer height={20} />
          <ResponsiveCard style={{ height: "400px" }} title={"Mining reward"}>
            <RewardDisplay rewards={rewards} />
          </ResponsiveCard>
        </Grid>
        <Grid item md={6} xs={12}>
          <ResponsiveCard
            style={{ height: "600px", overflowY: "scroll" }}
            title={"Transactions"}
          >
            <List>
              {user?.transactions?.map((t, index) => (
                <div key={`tx-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={t.time}
                      secondary={`${weiToETD(t.value)} ETD - ${
                        t.from.toLowerCase() === coinbase.toLowerCase()
                          ? "Sent"
                          : "Received"
                      }`}
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </ResponsiveCard>
        </Grid>
      </Grid>
      <Spacer height={20} />
      <ResponsiveCard title={"Devices"}>
        {/*<DeviceTable*/}
        {/*  devices={devices}*/}
        {/*  currentPageNumber={currentPage}*/}
        {/*  totalPageNumber={totalPageNumber}*/}
        {/*  totalNumRows={totalNumRows}*/}
        {/*  numPerPage={pageSize}*/}
        {/*  onPageChanged={async (page) => {*/}
        {/*    await router.push(`/user/${id}?pageNumber=${page}`, undefined, {*/}
        {/*      scroll: false,*/}
        {/*    });*/}
        {/*  }}*/}
        {/*/>*/}
      </ResponsiveCard>
      <Spacer height={20} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const user = context.params?.id as string;
  const currentPage = parseInt((context.query.page as string) ?? "0");
  const coinbase = context.query.coinbase as string;

  const storagePlugin = new StorageManagementSystemPlugin();

  // mining reward
  const prev = moment().subtract(7, "days");
  const miningUrl = new URL(
    `api/v2/miningReward/${coinbase}?start=${prev.format(
      "YYYY-MM-DD"
    )}&end=${moment().format("YYYY-MM-DD")}`,
    process.env.STATS_SERVER!
  );
  const miningRewardsPromise = axios.get(miningUrl.toString());

  // Get recent transactions
  const txURL = new URL(
    `/api/v2/transactions/${coinbase}`,
    process.env.STATS_SERVER!
  );
  const userResultPromise = axios.get(txURL.toString());

  // Get user devices
  const paginatedDevicesPromise = storagePlugin.getDeviceIdsByUser(
    currentPage,
    user
  );

  const [miningRewards, userResults, paginatedItems] = await Promise.all([
    miningRewardsPromise,
    userResultPromise,
    paginatedDevicesPromise,
  ]);

  const result: Props = {
    paginatedItems: paginatedItems,
    rewards: miningRewards.data.rewards,
    user: userResults.data.user,
    coinbase,
  };

  return {
    props: JSON.parse(JSON.stringify(result)),
  };
};
