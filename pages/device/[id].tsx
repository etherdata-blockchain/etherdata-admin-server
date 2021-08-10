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
import DeviceProvider, { DeviceContext } from "../model/DeviceProvider";
import { abbreviateNumber } from "../../utils/valueFormatter";
import { UIProviderContext } from "../model/UIProvider";
import { GetServerSideProps } from "next";
import { DeviceRegistrationPlugin } from "../../server/plugin/plugins/deviceRegistrationPlugin";
import { IDevice } from "../../server/schema/device";
import { objectExpand } from "../../utils/objectExpander";
import Logger from "../../server/logger";

type Props = {
  device: IDevice | null;
};

export default function TransactionDetail({ device }: Props) {
  const router = useRouter();
  const { devices, joinDetail, leaveDetail } = React.useContext(DeviceContext);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);

  const foundDevice = devices.find((d) => d.id === router.query.id);

  React.useEffect(() => {
    const deviceId = router.query.id!;
    //@ts-ignore
    joinDetail(deviceId);

    return () => {
      //@ts-ignore
      leaveDetail(deviceId);
    };
  }, []);

  return (
    <div>
      <PageHeader
        title={"Device"}
        description={`${device?.name}`}
        action={
          <Button
            onClick={() =>
              router.push(
                "/device/edit/" +
                  router.query.id +
                  "?deviceId=" +
                  foundDevice?.data?.systemInfo.nodeId
              )
            }
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
            title={`${foundDevice?.data?.blockNumber}`}
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
              {objectExpand(device ?? {}, ["__v", "_id"]).map(
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
  const deviceId = context.query.deviceId as string;
  if (deviceId === undefined || deviceId === "") {
    return {
      props: {
        device: null,
      },
    };
  }
  try {
    const plugin = new DeviceRegistrationPlugin();
    let device = await plugin.get(deviceId);
    return {
      props: {
        device: JSON.parse(JSON.stringify(device)),
      },
    };
  } catch (e) {
    Logger.error("Cannot read details: " + e);
    return {
      props: {
        device: null,
      },
    };
  }
};
