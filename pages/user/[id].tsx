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
import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Pagination,
} from "@mui/material";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Web3 from "web3";
import ResponsiveCard from "../../components/ResponsiveCard";
import { RewardDisplay } from "../../components/user/rewardDisplay";
import { weiToETD } from "../../utils/weiToETD";
import { DeviceTable } from "../../components/device/deviceTable";
import { ETDContext } from "../model/ETDProvider";
import { DeviceContext } from "../model/DeviceProvider";
import { DefaultPaginationResult } from "../../server/const/defaultValues";
import { Configurations } from "../../server/const/configurations";
import { IDevice } from "../../server/schema/device";
import StorageIcon from "@material-ui/icons/Storage";
import style from "../../styles/Device.module.css";
import ComputerIcon from "@material-ui/icons/Computer";

interface Props {
  coinbase: string;
  paginatedItems: PaginatedItems;
  currentPage: number;
  userID: string;
  userName: string;
  rewards: { date: string; reward: number }[];
  user: {
    balance: string;
    transactions: { from: string; value: string; time: string }[];
  };
}

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

  const {
    devices,
    totalNumberDevices,
    totalOnlineDevices,
    totalStorageNumber,
  } = paginationResult ?? DefaultPaginationResult;

  React.useEffect(() => {
    handlePageChange(storageDevices.map((d) => d.qr_code)).then(() => {});
  }, []);

  console.log(storageDevices);

  //@ts-ignore
  const displayDevices: IDevice[] = storageDevices.map((d) => {
    const foundDeviceInfo = devices.find((i) => i.id === d.qr_code);
    if (foundDeviceInfo) {
      //TODO: Add more info from storage device
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
            title={`${totalOnlineDevices} / ${totalNumberDevices}`}
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
        <DeviceTable
          devices={displayDevices}
          currentPageNumber={currentPage}
          totalPageNumber={totalPage}
          totalNumRows={totalDevices}
          numPerPage={Configurations.numberPerPage}
          onPageChanged={async (page) => {
            await router.push(
              `/user/${userID}?coinbase=${coinbase}&page=${page}`,
              undefined,
              {
                scroll: false,
              }
            );
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
};
