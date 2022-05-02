import React from "react";
import { GetServerSideProps } from "next";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import Spacer from "../../components/common/Spacer";
import {
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import queryString from "query-string";
import ResponsiveCard from "../../components/common/ResponsiveCard";
import { RewardDisplay } from "../../components/user/rewardDisplay";
import { DeviceTable } from "../../components/device/deviceTable";
import { DeviceAction } from "../../components/device/deviceAction";
import useSWR from "swr";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { PaddingBox } from "../../components/common/PaddingBox";
import { configs, interfaces, utils } from "@etherdata-blockchain/common";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { schema } from "@etherdata-blockchain/storage-model";
import { UserAvatar } from "../../components/user/userAvatar";
import { useStickyTabBar } from "../../hooks/useStickyTabBar";
import { StickyTabs } from "../../components/common/stickyTabs";
import { TabPanel } from "../../components/common/tabs/horizontal";
import { Build } from "@mui/icons-material";
import { dbServices } from "@etherdata-blockchain/services";
import UserInfoProvider from "../../model/UserInfoProvider";
import { UpdateUserInfoPanel } from "../../components/user/panels/UpdateUserInfoPanel";

interface Props {
  currentPage: number;
  rewards?: { date: string; reward: number }[];
  userMiningData?: {
    balance: string;
    transactions: { from: string; value: string; time: string }[];
  };
  userInfo: interfaces.db.StorageUserDBInterface;
  page: number;
  tabIndex: number;
}

/**
 * Building placeholder. Display a placeholder on screen
 * @constructor
 */
function Placeholder() {
  return (
    <Stack alignItems={"center"}>
      <Build fontSize={"large"} />
      <Typography>Not available yet</Typography>
    </Stack>
  );
}

/**
 * This page will display user info with their
 * coinbase, mining reward and devices
 * @param rewards
 * @param user
 * @param currentPage
 * @param page
 * @param tabIndex
 */
export default function ({
  rewards,
  userInfo,
  userMiningData,
  currentPage,
  page,
  tabIndex,
}: Props) {
  const router = useRouter();
  const [value] = useStickyTabBar(tabIndex);
  const { data, error } = useSWR<
    interfaces.PaginationResult<schema.IStorageItem>
  >(
    {
      userID: userInfo.user_id,
      page,
    },
    async (key) => {
      const result = await getAxiosClient().get(
        queryString.stringifyUrl({
          url: Routes.devicesWithStatus,
          query: { user: encodeURI(key.userID), page: key.page },
        })
      );

      return result.data;
    },
    { refreshInterval: configs.Configurations.defaultRefreshInterval }
  );

  return (
    <div>
      <Spacer height={20} />
      <PaddingBox>
        <UserAvatar
          username={userInfo.user_name}
          userId={userInfo.user_id}
          coinbase={userInfo.coinbase ?? ""}
        />
        {rewards && userMiningData && userInfo.coinbase && (
          <Grid container spacing={5}>
            <Grid item md={6} xs={12}>
              <LargeDataCard
                icon={<AccountBalanceWalletIcon />}
                title={"Balance"}
                color={"#7ed1e6"}
                iconColor={"#ffffff"}
                subtitle={`${utils.weiToETD(userMiningData.balance)} ETD`}
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
                  {userMiningData?.transactions?.map((t, index) => (
                    <div key={`tx-${index}`}>
                      <ListItem>
                        <ListItemText
                          primary={t.time}
                          secondary={`${utils.weiToETD(t.value)} ETD - ${
                            t.from.toLowerCase() ===
                            userInfo.coinbase!.toLowerCase()
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
      </PaddingBox>
      <StickyTabs
        initialIndex={tabIndex}
        labels={["Devices", "Transactions", "Mining reward", "Settings"]}
        top={0}
        pushTo={`/user/${userInfo.user_id}`}
        urlKeyName={"tabIndex"}
      />
      <Spacer height={10} />
      <PaddingBox>
        <TabPanel index={0} value={value}>
          <ResponsiveCard title={"Devices"} action={<DeviceAction />}>
            {error && <Alert severity={"error"}>{error.toString()}</Alert>}
            <DeviceTable
              devices={data?.results}
              loading={data === undefined && !error}
              currentPageNumber={currentPage}
              totalPageNumber={data?.totalPage ?? 0}
              totalNumRows={data?.count ?? 0}
              numPerPage={
                data?.pageSize ?? configs.Configurations.numberPerPage
              }
              onPageChanged={async (page) => {
                //TODO
                if (page < 1) {
                  return;
                }
                const query = queryString.stringify({
                  ...router.query,
                  coinbase: userInfo.coinbase,
                  page: page,
                });

                await router.push(
                  `/user/${userInfo.user_id}?${query}`,
                  undefined,
                  {
                    scroll: false,
                  }
                );
              }}
            />
          </ResponsiveCard>
        </TabPanel>
        <TabPanel index={1} value={value}>
          <Placeholder />
        </TabPanel>
        <TabPanel index={2} value={value}>
          <Placeholder />
        </TabPanel>
        <TabPanel index={3} value={value}>
          <UserInfoProvider>
            <UpdateUserInfoPanel userInfo={userInfo} />
          </UserInfoProvider>
        </TabPanel>
        <Spacer height={20} />
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const userId = context.params?.id as string;
  const currentPage = parseInt((context.query.page as string) ?? "1");
  const tabIndex = parseInt((context.query.tabIndex as string) ?? "0");

  const ownerService = new dbServices.StorageManagementOwnerService();

  const filteredUserData = await ownerService.filter(
    { user_id: userId },
    configs.Configurations.defaultPaginationStartingPage,
    1
  );

  if (filteredUserData!.count === 0) {
    return {
      notFound: true,
    };
  }

  const user = filteredUserData!.results[0];

  //TODO: Change this to following line when stats server is rebuilt in the future
  // if (coinbase && coinbase.startsWith("0x")) {
  if (false) {
    // mining reward
    const prev = moment().subtract(7, "days");
    const miningUrl = new URL(
      `api/v2/miningReward/${user.coinbase}?start=${prev.format(
        "YYYY-MM-DD"
      )}&end=${moment().format("YYYY-MM-DD")}`,
      configs.Environments.ServerSideEnvironments.STATS_SERVER!
    );
    const miningRewardsPromise = axios.get(miningUrl.toString());

    // Get recent transactions
    const txURL = new URL(
      `/api/v2/transactions/${user.coinbase}`,
      configs.Environments.ServerSideEnvironments.STATS_SERVER!
    );
    const userResultPromise = axios.get(txURL.toString());

    const [miningRewards, userResults] = await Promise.all([
      miningRewardsPromise,
      userResultPromise,
    ]);

    const result: Props = {
      currentPage,
      rewards: miningRewards.data.rewards,
      userMiningData: userResults.data.user,
      userInfo: user,
      page: currentPage,
      tabIndex,
    };

    return {
      props: JSON.parse(JSON.stringify(result)),
    };
  }

  const result: Props = {
    currentPage,
    rewards: [],
    userMiningData: undefined,
    userInfo: {
      user_id: user.user_id,
      user_name: user.user_name,
      coinbase: user.coinbase,
    },
    page: currentPage,
    tabIndex,
  };

  return {
    props: JSON.parse(JSON.stringify(result)),
  };
};
