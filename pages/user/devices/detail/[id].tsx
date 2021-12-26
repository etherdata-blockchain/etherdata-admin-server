// @flow
import * as React from "react";
import PageHeader from "../../../../components/PageHeader";
import Spacer from "../../../../components/Spacer";
import {
  Button,
  Card,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import ComputerIcon from "@material-ui/icons/Computer";
import style from "../../../../styles/Device.module.css";
import { LargeDataCard } from "../../../../components/cards/largeDataCard";
import { GridDataCard } from "../../../../components/cards/gridDataCard";
import { useRouter } from "next/dist/client/router";
import { DeviceContext, socket } from "../../../model/DeviceProvider";
import { abbreviateNumber } from "../../../../internal/utils/valueFormatter";
import { UIProviderContext } from "../../../model/UIProvider";
import { GetServerSideProps } from "next";
import { objectExpand } from "../../../../internal/utils/objectExpander";
import Logger from "../../../../server/logger";
import moment from "moment";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import AlbumIcon from "@mui/icons-material/Album";
import { ContainerDialog } from "../../../../components/device/dialog/containerDialog";
import { ImageDialog } from "../../../../components/device/dialog/imageDialog";
import { Configurations } from "../../../../internal/const/configurations";
import { StorageManagementItemPlugin } from "../../../../internal/services/dbServices/storage-management-item-plugin";
import { IStorageItem } from "../../../../internal/services/dbSchema/device/storage/item";

type Props = {
  device: IStorageItem | null;
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
    IStorageItem | undefined
  >(device ?? undefined);
  const online =
    Math.abs(
      moment(foundDevice?.deviceStatus.lastSeen).diff(moment(), "seconds")
    ) < Configurations.maximumNotSeenDuration;

  const storageInfo = {
    adminVersion: foundDevice?.deviceStatus.adminVersion,
    owner: foundDevice?.owner_id,
  };

  React.useEffect(() => {
    console.log("Joining room", device?.qr_code);
    // @ts-ignore
    if (found) joinDetail(device?.qr_code);

    socket?.on("detail-info", (data) => {
      console.log(data);
      if (foundDevice) {
        foundDevice.deviceStatus = data;
      }
      setFoundDevice(foundDevice);
    });

    return () => {
      // @ts-ignore
      if (found) leaveDetail(device?.id);
    };
  }, []);

  // @ts-ignore
  return (
    <div>
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
      <Grid container spacing={5}>
        <Grid item md={3} xs={6}>
          <LargeDataCard
            icon={<ComputerIcon />}
            // @ts-ignore
            title={`${abbreviateNumber(foundDevice?.data?.difficulty ?? 0)}`}
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
            icon={<ComputerIcon />}
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
              { title: "100%", subtitle: "CPU", icon: <ComputerIcon /> },
              { title: "100%", subtitle: "Memory", icon: <ComputerIcon /> },
              { title: "100%", subtitle: "Hard Disk", icon: <ComputerIcon /> },
              {
                title: "100%",
                subtitle: "Update Time",
                icon: <ComputerIcon />,
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
            subtitle={"Docker installation-template"}
            className={style.detailDataCard}
            onClick={() => setShowImageDetails(true)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant={"subtitle1"} style={{ margin: 15 }}>
            Status
          </Typography>
          <Card>
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
                      {foundDevice?.deviceStatus.lastSeen}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Card>
          <Typography variant={"subtitle1"} style={{ margin: 15 }}>
            Storage Info
          </Typography>
          <Card>
            {/*@ts-ignore*/}
            {objectExpand(storageInfo, []).map(({ key, value }, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={key}
                  secondary={<Typography noWrap>{value}</Typography>}
                />
              </ListItem>
            ))}
          </Card>

          <List>
            <Typography variant={"subtitle1"} style={{ margin: 15 }}>
              Mining info
            </Typography>
            <Card>
              {/*@ts-ignore*/}
              {objectExpand(foundDevice?.data, [
                "__v",
                "_id",
                "miner",
                "docker",
              ]).map(({ key, value }, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={key}
                    secondary={<Typography noWrap>{value}</Typography>}
                  />
                </ListItem>
              ))}
            </Card>
          </List>

          <List>
            <ListSubheader>Peers</ListSubheader>
            {foundDevice?.deviceStatus.data?.peers?.map((p, i) => (
              <ListItem key={i}>
                <ListItemAvatar>{i + 1}</ListItemAvatar>
                <ListItemText primary={"Device IP"} secondary={"abcde"} />
              </ListItem>
            ))}
          </List>
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
    const plugin = new StorageManagementItemPlugin();
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
