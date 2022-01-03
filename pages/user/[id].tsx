import React from "react";
import { GetServerSideProps } from "next";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import PageHeader from "../../components/common/PageHeader";
import Spacer from "../../components/common/Spacer";
import {
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import queryString from "query-string";
import ResponsiveCard from "../../components/common/ResponsiveCard";
import { RewardDisplay } from "../../components/user/rewardDisplay";
import { weiToETD } from "../../internal/utils/weiToETD";
import { DeviceTable } from "../../components/device/deviceTable";
import { ETDContext } from "../model/ETDProvider";
import { Configurations } from "../../internal/const/configurations";
import StorageIcon from "@material-ui/icons/Storage";
import style from "../../styles/Device.module.css";
import ComputerIcon from "@material-ui/icons/Computer";
import { DeviceAction } from "../../components/device/deviceAction";
import { Environments } from "../../internal/const/environments";
import useSWR from "swr";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { Routes } from "../../internal/const/routes";
import { PaginationResult } from "../../internal/const/common_interfaces";
import { IStorageItem } from "../../internal/services/dbSchema/device/storage/item";
import { PaddingBox } from "../../components/common/PaddingBox";

interface Props {
  coinbase: string | undefined;
  currentPage: number;
  userID: string;
  userName: string;
  rewards?: { date: string; reward: number }[];
  user?: {
    balance: string;
    transactions: { from: string; value: string; time: string }[];
  };
  page: number;
}

/**
 * This page will display user info with their
 * coinbase, mining reward and devices
 * @param rewards
 * @param user
 * @param coinbase
 * @param currentPage
 * @param userID
 * @param userName
 */
export default function ({
  rewards,
  user,
  coinbase,
  currentPage,
  userID,
  userName,
  page,
}: Props) {
  const router = useRouter();
  const { history } = React.useContext(ETDContext);
  const { data, error } = useSWR<PaginationResult<IStorageItem>>(
    { userID, page },
    async (key) => {
      const result = await getAxiosClient().get(
        queryString.stringifyUrl({
          url: Routes.devicesWithStatus,
          query: { user: encodeURI(key.userID), page: key.page },
        })
      );

      return result.data;
    }
  );

  return (
    <div>
      <PageHeader title={"User"} description={userName} />
      <Spacer height={20} />
      <PaddingBox>
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
          <Grid item md={4} xs={6}>
            <LargeDataCard
              icon={<ComputerIcon />}
              title={`${data?.count}`}
              color={"#ba03fc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#9704cc"}
              subtitle={"In storage"}
              className={style.detailDataCard}
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <LargeDataCard
              icon={<ComputerIcon />}
              title={`${data?.count}`}
              color={"#ba03fc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#9704cc"}
              subtitle={"Active Device"}
              className={style.detailDataCard}
            />
          </Grid>
        </Grid>
        <Spacer height={10} />
        {rewards && user && coinbase && (
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
              <ResponsiveCard
                style={{ height: "400px" }}
                title={"Mining reward"}
              >
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
        )}

        <Spacer height={20} />
        <ResponsiveCard title={"Devices"} action={<DeviceAction />}>
          {error && <Alert severity={"error"}>{error.toString()}</Alert>}
          <DeviceTable
            devices={data?.results}
            loading={data === undefined && !error}
            currentPageNumber={currentPage}
            totalPageNumber={data?.totalPage ?? 0}
            totalNumRows={data?.count ?? 0}
            numPerPage={data?.pageSize ?? Configurations.numberPerPage}
            onPageChanged={async (page) => {
              //TODO
              if (page < 1) {
                return;
              }
              const query = queryString.stringify({
                coinbase: coinbase,
                page: page,
              });
              await router.push(`/user/${userID}?${query}`, undefined, {
                scroll: false,
              });
            }}
          />
        </ResponsiveCard>
        <Spacer height={20} />
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const user = context.params?.id as string;
  const name = context.query.name as string;
  const currentPage = parseInt((context.query.page as string) ?? "1");
  const coinbase = context.query.coinbase as string | undefined;

  if (coinbase && coinbase.startsWith("0x")) {
    // mining reward
    const prev = moment().subtract(7, "days");
    const miningUrl = new URL(
      `api/v2/miningReward/${coinbase}?start=${prev.format(
        "YYYY-MM-DD"
      )}&end=${moment().format("YYYY-MM-DD")}`,
      Environments.ServerSideEnvironments.STATS_SERVER!
    );
    const miningRewardsPromise = axios.get(miningUrl.toString());

    // Get recent transactions
    const txURL = new URL(
      `/api/v2/transactions/${coinbase}`,
      Environments.ServerSideEnvironments.STATS_SERVER!
    );
    const userResultPromise = axios.get(txURL.toString());

    const [miningRewards, userResults] = await Promise.all([
      miningRewardsPromise,
      userResultPromise,
    ]);

    const result: Props = {
      userID: user,
      currentPage,
      rewards: miningRewards.data.rewards,
      user: userResults.data.user,
      coinbase,
      userName: name,
      page: currentPage,
    };

    return {
      props: JSON.parse(JSON.stringify(result)),
    };
  }

  const result: Props = {
    userID: user,
    currentPage,
    rewards: [],
    user: undefined,
    coinbase,
    userName: name,
    page: currentPage,
  };

  return {
    props: JSON.parse(JSON.stringify(result)),
  };
};
