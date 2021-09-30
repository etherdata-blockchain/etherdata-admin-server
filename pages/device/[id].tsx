// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import Spacer from "../../components/Spacer";
import ResponsiveCard from "../../components/ResponsiveCard";
import {
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@material-ui/core";
import ComputerIcon from "@material-ui/icons/Computer";
import style from "../../styles/Device.module.css";
import { LargeDataCard } from "../../components/cards/largeDataCard";
import { DurationSelectorBtn } from "../../components/home/DurationSelectorBtn";
import { GridDataCard } from "../../components/cards/gridDataCard";
import { PanelSelector } from "../../components/device/panelSelector";
import { useRouter } from "next/dist/client/router";
import DeviceProvider, { DeviceContext, socket } from "../model/DeviceProvider";
import { abbreviateNumber } from "../../utils/valueFormatter";
import { UIProviderContext } from "../model/UIProvider";
import { GetServerSideProps } from "next";
import { DeviceRegistrationPlugin } from "../../server/plugin/plugins/deviceRegistrationPlugin";
import { IDevice } from "../../server/schema/device";
import { objectExpand } from "../../utils/objectExpander";
import Logger from "../../server/logger";
import { NodePlugin } from "../../server/plugin/plugins/socketIOPlugins/nodePlugin";

type Props = {
  device: IDevice | null;
  online: boolean;
  found: boolean;
};

export default function DeviceDetail({ device, online, found }: Props) {
  const router = useRouter();
  const { joinDetail, leaveDetail } = React.useContext(DeviceContext);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [foundDevice, setFoundDevice] = React.useState<IDevice | undefined>(
    device ?? undefined
  );

  React.useEffect(() => {
    console.log("Joining room", device?.id);
    //@ts-ignore
    if (found) joinDetail(device?.id);

    socket?.on("detail-info", (data) => {
      setFoundDevice(data);
    });

    return () => {
      //@ts-ignore
      if (found) leaveDetail(device?.id);
    };
  }, []);

  if (!found) {
    return <div>Device Not Found</div>;
  }

  return (
    <div>
      <PageHeader
        title={"Device"}
        description={`${device?.id}`}
        action={
          <Button
            onClick={() => router.push("/device/edit/" + router.query.id)}
            variant={"outlined"}
          >
            Edit
          </Button>
        }
      />
      <Spacer height={20} />
      <Grid container spacing={5}>
        <Grid item md={3}>
          <LargeDataCard
            icon={<ComputerIcon />}
            //@ts-ignore
            title={`${abbreviateNumber(foundDevice?.data?.difficulty ?? 0)}`}
            color={"#ba03fc"}
            subtitleColor={"white"}
            iconColor={"white"}
            iconBackgroundColor={"#9704cc"}
            subtitle={"Current Difficulty"}
            className={style.detailDataCard}
          />
        </Grid>
        <Grid item md={3}>
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

        <Grid item md={6}>
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
        <Grid item xs={12}>
          <ResponsiveCard>
            <List>
              {objectExpand(foundDevice!, ["__v", "_id"]).map(
                ({ key, value }, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={key} secondary={`${value}`} />
                  </ListItem>
                )
              )}

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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const deviceId = context.query.id as string;
  let device: any | null = null;
  let online: boolean = false;
  let found: boolean = false;

  try {
    const plugin = new DeviceRegistrationPlugin();
    console.log(deviceId);
    const client = await plugin.findDeviceByDeviceID(deviceId);
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
