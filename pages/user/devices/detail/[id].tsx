// @flow
import * as React from "react";
import PageHeader from "../../../../components/PageHeader";
import Spacer from "../../../../components/Spacer";
import ResponsiveCard from "../../../../components/ResponsiveCard";
import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
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
import { IDevice } from "../../../../internal/services/dbSchema/device/device";
import { objectExpand } from "../../../../internal/utils/objectExpander";
import Logger from "../../../../server/logger";
import moment from "moment";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import AlbumIcon from "@mui/icons-material/Album";
import { ContainerDialog } from "../../../../components/device/dialog/containerDialog";
import { ImageDialog } from "../../../../components/device/dialog/imageDialog";
import { Configurations } from "../../../../internal/const/configurations";
import { StorageManagementItemPlugin } from "../../../../internal/services/dbServices/storage-management-item-plugin";

type Props = {
  device: IDevice | null;
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

  const [foundDevice, setFoundDevice] = React.useState<IDevice | undefined>(
    device ?? undefined
  );
  const online =
    Math.abs(moment(foundDevice?.lastSeen).diff(moment(), "seconds")) <
    Configurations.maximumNotSeenDuration;

  React.useEffect(() => {
    console.log("Joining room", device?.id);
    // @ts-ignore
    if (found) joinDetail(device?.id);

    socket?.on("detail-info", (data) => {
      setFoundDevice(data);
    });

    return () => {
      // @ts-ignore
      if (found) leaveDetail(device?.id);
    };
  }, []);

  return (
    <div>
      <PageHeader
        title={"Device"}
        description={`${device?.id}`}
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
            title={`${foundDevice?.data?.number}`}
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
            title={`${foundDevice?.docker?.containers.length}`}
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
            title={`${foundDevice?.docker?.images.length}`}
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
          <ResponsiveCard>
            <ListItem>
              <ListItemText
                primary={"Is Online"}
                secondary={`${found && online}`}
              />
            </ListItem>

            <ListItemButton
              onClick={async () => {
                await router.push("/user/" + foundDevice?.data?.miner);
              }}
            >
              <ListItemText
                primary={"miner"}
                secondary={
                  <Typography noWrap>{foundDevice?.data?.miner}</Typography>
                }
              />
            </ListItemButton>

            <List>
              {objectExpand(foundDevice!, [
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

              <ListSubheader>Peers</ListSubheader>
              {foundDevice?.data?.peers.map((p, i) => (
                <ListItem key={i}>
                  <ListItemAvatar>{i + 1}</ListItemAvatar>
                  <ListItemText primary={"Device IP"} secondary={"abcde"} />
                </ListItem>
              ))}
            </List>
          </ResponsiveCard>
        </Grid>
      </Grid>

      {foundDevice?.docker?.containers && (
        <ContainerDialog
          show={showContainerDetails}
          onClose={() => setShowContainerDetails(false)}
          containers={foundDevice?.docker?.containers}
        />
      )}

      {foundDevice?.docker?.images && (
        <ImageDialog
          images={foundDevice.docker.images}
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

  return {
    props: {
      device,
      online,
      found,
    },
  };
};
