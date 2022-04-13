// @flow
import * as React from "react";
import PageHeader from "../../../../components/common/PageHeader";
import Spacer from "../../../../components/common/Spacer";
import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import style from "../../../../styles/Device.module.css";
import { LargeDataCard } from "../../../../components/cards/largeDataCard";
import { GridDataCard } from "../../../../components/cards/gridDataCard";
import { useRouter } from "next/dist/client/router";
import { DeviceContext, socket } from "../../../model/DeviceProvider";
import { UIProviderContext } from "../../../model/UIProvider";
import { GetServerSideProps } from "next";
import moment from "moment";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import AlbumIcon from "@mui/icons-material/Album";
import { ContainerDialog } from "../../../../components/device/dialog/containerDialog";
import { ImageDialog } from "../../../../components/device/dialog/imageDialog";
import { configs, utils } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import Logger from "@etherdata-blockchain/logger";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import { AccessTime, Computer, LockClock, People } from "@mui/icons-material";
import ResponsiveCard from "../../../../components/common/ResponsiveCard";
import { abbreviateNumber } from "@etherdata-blockchain/common/dist/utils";
import ConstructionIcon from "@mui/icons-material/Construction";

type Props = {
  device: schema.IStorageItem | undefined;
  online: boolean;
  found: boolean;
};

// eslint-disable-next-line require-jsdoc
export default function DeviceDetail({ device, found }: Props) {
  const router = useRouter();
  const { joinDetail, leaveDetail } = React.useContext(DeviceContext);
  const {} = React.useContext(UIProviderContext);
  const [showContainerDetails, setShowContainerDetails] = React.useState(false);
  const [showImageDetails, setShowImageDetails] = React.useState(false);

  const [foundDevice, setFoundDevice] = React.useState<
    schema.IStorageItem | undefined
  >(device);
  const online =
    Math.abs(
      moment(foundDevice?.deviceStatus.lastSeen).diff(moment(), "seconds")
    ) < configs.Configurations.maximumNotSeenDuration;

  const storageInfo = {
    adminVersion: foundDevice?.deviceStatus.adminVersion,
    owner: foundDevice?.owner_id,
  };

  React.useEffect(() => {
    console.log("Joining room", device!.qr_code);
    if (found) joinDetail(device!.qr_code!);

    socket?.on("detail-info", (data) => {
      if (foundDevice) {
        foundDevice.deviceStatus = data;
        setFoundDevice(JSON.parse(JSON.stringify(foundDevice)));
      }
    });

    return () => {
      if (found) leaveDetail(device!.id);
    };
  }, []);

  return (
    <div>
      <Spacer height={20} />
      <PageHeader
        title={"Device"}
        description={`${device?.qr_code}`}
        action={
          <Button
            onClick={() =>
              router.push("/user/devices/detail/edit/" + router.query.id)
            }
            variant={"outlined"}
          >
            Edit
          </Button>
        }
      />
      <Spacer height={20} />
      <PaddingBox>
        <Grid container spacing={5}>
          <Grid item md={3} xs={6}>
            <LargeDataCard
              icon={<Computer />}
              title={`${utils.abbreviateNumber(
                foundDevice?.deviceStatus?.data?.difficulty ?? 0
              )}`}
              color={"#ba03fc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#9704cc"}
              subtitle={"Current Difficulty"}
              className={style.detailDataCard}
            />
          </Grid>
          <Grid item md={3} xs={6}>
            <LargeDataCard
              icon={<Computer />}
              title={`${foundDevice?.deviceStatus?.data?.number}`}
              color={"#ba03fc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#9704cc"}
              subtitle={"Current Block Number"}
              className={style.detailDataCard}
            />
          </Grid>

          <Grid item md={6} xs={12}>
            <GridDataCard
              className={style.detailDataCard}
              backgroundColor={"#3385ff"}
              titleColor={"white"}
              subtitleColor={"white"}
              items={[
                {
                  title: `${foundDevice?.deviceStatus?.data?.systemInfo?.peerCount}`,
                  subtitle: "Peers",
                  icon: <People />,
                },
                {
                  title: `${abbreviateNumber(
                    foundDevice?.deviceStatus?.data?.systemInfo?.hashRate ?? 0
                  )}`,
                  subtitle: "HashRate",
                  icon: <ConstructionIcon />,
                },
                {
                  title: `${foundDevice?.deviceStatus?.data?.blockTime}s`,
                  subtitle: "Block Time",
                  icon: <LockClock />,
                },
                {
                  title: `${foundDevice?.deviceStatus?.data?.avgBlockTime}s`,
                  subtitle: "Average Block Time",
                  icon: <AccessTime />,
                },
              ]}
            />
          </Grid>
          <Grid item xs={6}>
            <LargeDataCard
              icon={<AllInboxIcon />}
              title={`${foundDevice?.deviceStatus.docker?.containers?.length}`}
              color={"#ba03fc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#9704cc"}
              subtitle={"Docker containers"}
              className={style.detailDataCard}
              onClick={() => {
                setShowContainerDetails(true);
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <LargeDataCard
              icon={<AlbumIcon />}
              title={`${foundDevice?.deviceStatus.docker?.images?.length}`}
              color={"#ba03fc"}
              subtitleColor={"white"}
              iconColor={"white"}
              iconBackgroundColor={"#9704cc"}
              subtitle={"Docker images"}
              className={style.detailDataCard}
              onClick={() => setShowImageDetails(true)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResponsiveCard title={"Status"}>
              <List>
                <ListItem>
                  <ListItemText
                    primary={"Online"}
                    secondary={<Typography noWrap>{`${online}`}</Typography>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={"Last Seen"}
                    secondary={
                      <Typography noWrap>
                        {moment(foundDevice?.deviceStatus.lastSeen).fromNow()}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={"Is Mining"}
                    secondary={
                      <Typography noWrap>
                        {`${foundDevice?.deviceStatus?.data?.systemInfo.isMining}`}
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={"Is Syncing"}
                    secondary={
                      <Typography noWrap>
                        {`${foundDevice?.deviceStatus?.data?.systemInfo.isMining}`}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </ResponsiveCard>
            <Spacer height={20} />
            <ResponsiveCard title={"Storage Info"}>
              {utils
                .objectExpand(storageInfo, [])
                .map(({ key, value }, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={key}
                      secondary={<Typography noWrap>{value}</Typography>}
                    />
                  </ListItem>
                ))}
            </ResponsiveCard>

            <Spacer height={20} />
            <ResponsiveCard title={"Mining Info"}>
              {utils
                .objectExpand(foundDevice?.deviceStatus?.data ?? {}, [
                  "__v",
                  "_id",
                  "miner",
                  "docker",
                  "avgBlockTime",
                  "blockTime",
                  "timestamp",
                  "transactionsRoot",
                  "isMining",
                  "isSyncing",
                  "name",
                  "nodeId",
                  "number",
                  "peerCount",
                  "hashRate",
                ])
                .map(({ key, value }, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={key}
                      secondary={<Typography noWrap>{value}</Typography>}
                    />
                  </ListItem>
                ))}
            </ResponsiveCard>
          </Grid>
        </Grid>

        {foundDevice?.deviceStatus.docker?.containers && (
          <ContainerDialog
            show={showContainerDetails}
            onClose={() => setShowContainerDetails(false)}
            containers={foundDevice?.deviceStatus.docker?.containers}
          />
        )}

        {foundDevice?.deviceStatus.docker?.images && (
          <ImageDialog
            images={foundDevice.deviceStatus.docker.images}
            show={showImageDetails}
            onClose={() => setShowImageDetails(false)}
          />
        )}
      </PaddingBox>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const deviceId = context.query.id as string;
  let device: any | null = null;
  const online: boolean = false;
  let found: boolean = false;

  try {
    const plugin = new dbServices.StorageManagementService();
    const client = await plugin.getDeviceByID(deviceId);
    if (client) {
      found = true;
      device = client;
    }
  } catch (e) {
    Logger.error("Cannot read details: " + e);
  }

  const data: Props = {
    device,
    online,
    found,
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
