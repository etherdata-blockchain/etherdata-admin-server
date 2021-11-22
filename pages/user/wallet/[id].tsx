// @flow
import * as React from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/dist/client/router";
import axios from "axios";
import moment from "moment";
import { Divider, Grid, List, ListItem, ListItemText } from "@mui/material";

import Web3 from "web3";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { DeviceTable } from "../../../components/device/deviceTable";
import ResponsiveCard from "../../../components/ResponsiveCard";
import Spacer from "../../../components/Spacer";
import { RewardDisplay } from "../../../components/user/rewardDisplay";
import { LargeDataCard } from "../../../components/cards/largeDataCard";
import PageHeader from "../../../components/PageHeader";
import { IDevice } from "../../../server/schema/device";
import { DeviceRegistrationPlugin } from "../../../server/plugin/plugins/deviceRegistrationPlugin";
import { weiToETD } from "../../../utils/weiToETD";

const pageSize = 20;

type Props = {
  devices: IDevice[];
  totalPageNumber: number;
  totalNumRows: number;
  currentPage: number;
  id: string;
  rewards: { date: string; reward: number }[];
  user: {
    balance: string;
    transactions: { from: string; value: string; time: string }[];
  };
};

export default function UserDetail({
  devices,
  currentPage,
  totalPageNumber,
  totalNumRows,
  id,
  rewards,
  user,
}: Props) {
  const router = useRouter();
  return (
    <div>
      <PageHeader title={"User"} description={id} />
      <Spacer height={20} />
      <Grid container spacing={5}>
        <Grid item md={6} xs={12}>
          <LargeDataCard
            icon={<AccountBalanceWalletIcon />}
            title={"Balance"}
            color={"#7ed1e6"}
            iconColor={"#ffffff"}
            subtitle={`${Web3.utils.fromWei(user.balance, "ether")} ETD`}
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
              {user.transactions.map((t, index) => (
                <div key={`tx-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={t.time}
                      secondary={`${weiToETD(t.value)} ETD - ${
                        t.from.toLowerCase() === id.toLowerCase()
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
        <DeviceTable
          devices={devices}
          currentPageNumber={currentPage}
          totalPageNumber={totalPageNumber}
          totalNumRows={totalNumRows}
          numPerPage={pageSize}
          onPageChanged={async (page) => {
            await router.push(`/user/${id}?pageNumber=${page}`, undefined, {
              scroll: false,
            });
          }}
        />
      </ResponsiveCard>
      <Spacer height={20} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const { id } = context.params!;
  const { pageNumber } = context.query;

  const minerAddress = Web3.utils.toChecksumAddress(id as string);
  // Get devices by miner address
  const plugin = new DeviceRegistrationPlugin();
  const devicesPromise = plugin.getDevicesByMiner(
    minerAddress as string,
    parseInt((pageNumber as string) ?? "0"),
    pageSize
  );

  // Get user's mining reward
  const now = moment();
  const prev = moment().subtract(7, "days");
  const url = new URL(
    `api/v2/miningReward/${id}?start=${prev.format(
      "YYYY-MM-DD"
    )}&end=${now.format("YYYY-MM-DD")}`,
    process.env.STATS_SERVER!
  );
  const resultPromise = axios.get(url.toString());

  // Get recent transactions
  const txURL = new URL(
    `/api/v2/transactions/${minerAddress}`,
    process.env.STATS_SERVER!
  );
  const userResultPromise = axios.get(txURL.toString());

  const [[devices, totalNumRows, totalPageNumber], result, userResult] =
    await Promise.all([devicesPromise, resultPromise, userResultPromise]);

  return {
    props: {
      devices: JSON.parse(JSON.stringify(devices)),
      totalNumRows,
      totalPageNumber,
      currentPage: parseInt((pageNumber as string) ?? "0"),
      id: id as string,
      rewards: result.data.rewards,
      user: userResult.data.user,
    },
  };
};