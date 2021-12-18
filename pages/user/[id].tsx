import React from "react";
import { GetServerSideProps } from "next";
import moment from "moment";
import axios from "axios";
import {
  PaginatedItems,
  StorageManagementSystemPlugin,
<<<<<<< HEAD
<<<<<<< HEAD
} from "../../services/dbServices/storageManagementSystemPlugin";
=======
} from "../../internal/services/dbServices/storage-management-system-plugin";
>>>>>>> upstream/install-script
=======
} from "../../internal/services/dbServices/storage-management-system-plugin";
>>>>>>> upstream/dev
import { useRouter } from "next/dist/client/router";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import { Divider, Grid, List, ListItem, ListItemText } from "@mui/material";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import queryString from "querystring";
import ResponsiveCard from "../../components/ResponsiveCard";
import { RewardDisplay } from "../../components/user/rewardDisplay";
import { weiToETD } from "../../internal/utils/weiToETD";
import { DeviceTable } from "../../components/device/deviceTable";
import { ETDContext } from "../model/ETDProvider";
import { DeviceContext } from "../model/DeviceProvider";
import {
  DefaultPaginationResult,
  DefaultStorageUser,
<<<<<<< HEAD
<<<<<<< HEAD
} from "../../server/const/defaultValues";
import { Configurations } from "../../server/const/configurations";
import { IDevice } from "../../services/dbSchema/device";
=======
} from "../../internal/const/defaultValues";
import { Configurations } from "../../internal/const/configurations";
import { IDevice } from "../../internal/services/dbSchema/device";
>>>>>>> upstream/install-script
=======
} from "../../internal/const/defaultValues";
import { Configurations } from "../../internal/const/configurations";
import { IDevice } from "../../internal/services/dbSchema/device";
>>>>>>> upstream/dev
import StorageIcon from "@material-ui/icons/Storage";
import style from "../../styles/Device.module.css";
import ComputerIcon from "@material-ui/icons/Computer";
import { DeviceAction } from "../../components/device/deviceAction";
import { Environments } from "../../internal/const/environments";

interface Props {
  coinbase: string | undefined;
  paginatedItems: PaginatedItems;
  currentPage: number;
  userID: string;
  userName: string;
  rewards?: { date: string; reward: number }[];
  user?: {
    balance: string;
    transactions: { from: string; value: string; time: string }[];
  };
}

/**
 * This page will display user info with their
 * coinbase, mining reward and devices
 * @param rewards
 * @param user
 * @param paginatedItems
 * @param coinbase
 * @param currentPage
 * @param userID
 * @param userName
 */
export default function ({
  rewards,
  user,
  paginatedItems,
  coinbase,
  currentPage,
  userID,
  userName,
}: Props) {
  const { totalPage, totalDevices, storageDevices } = paginatedItems;
  const router = useRouter();
  const { handlePageChange, paginationResult } =
    React.useContext(DeviceContext);
  const { history } = React.useContext(ETDContext);

  const { devices, totalOnlineDevices, totalStorageNumber, clientFilter } =
    paginationResult ?? DefaultPaginationResult;

  React.useEffect(() => {
    handlePageChange(storageDevices.map((d) => d.qr_code)).then(() => {});
  }, []);

  // @ts-ignore
  const displayDevices: IDevice[] = storageDevices
    .filter((d) => {
      // If we apply a filter, then we return devices with realtime status
      if (clientFilter) {
        const foundDeviceInfo = devices.find((i) => i.id === d.qr_code);
        return foundDeviceInfo !== undefined;
      }

      // Otherwise, we return all
      return true;
    })
    .map((d) => {
      const foundDeviceInfo = devices.find((i) => i.id === d.qr_code);
      if (foundDeviceInfo) {
        // TODO: Add more info from storage device
        return {
          ...foundDeviceInfo,
        };
      }
      return {
        _id: d._id,
        id: d.qr_code,
        name: d.name,
      };
    });

  return (
    <div>
      <PageHeader title={"User"} description={userName} />
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
        <Grid item md={4} xs={6}>
          <LargeDataCard
            icon={<ComputerIcon />}
            title={`${totalStorageNumber}`}
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
            title={`${totalOnlineDevices}`}
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
      )}

      <Spacer height={20} />
      <ResponsiveCard title={"Devices"} action={<DeviceAction />}>
        <DeviceTable
          devices={displayDevices}
          currentPageNumber={currentPage}
          totalPageNumber={totalPage}
          totalNumRows={totalDevices}
          numPerPage={Configurations.numberPerPage}
          onPageChanged={async (page) => {
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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const user = context.params?.id as string;
  const name = context.query.name as string;
  const currentPage = parseInt((context.query.page as string) ?? "0");
  const coinbase = context.query.coinbase as string | undefined;

  const storagePlugin = new StorageManagementSystemPlugin();

  if (coinbase) {
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

    // Get user devices
    const paginatedDevicesPromise = storagePlugin.getDevicesByUser(
      currentPage,
      user
    );

    const [miningRewards, userResults, paginatedItems] = await Promise.all([
      miningRewardsPromise,
      userResultPromise,
      paginatedDevicesPromise,
    ]);

    const result: Props = {
      userID: user,
      paginatedItems: paginatedItems,
      currentPage,
      rewards: miningRewards.data.rewards,
      user: userResults.data.user,
      coinbase,
      userName: name,
    };

    return {
      props: JSON.parse(JSON.stringify(result)),
    };
  }

  // Get user devices
  const paginatedDevices = await storagePlugin.getDevicesByUser(
    currentPage,
    user === DefaultStorageUser.id ? undefined : user
  );

  const result: Props = {
    userID: user,
    paginatedItems: paginatedDevices,
    currentPage,
    rewards: [],
    user: undefined,
    coinbase,
    userName: name,
  };

  return {
    props: JSON.parse(JSON.stringify(result)),
  };
};
