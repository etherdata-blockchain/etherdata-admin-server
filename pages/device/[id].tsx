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

type Props = {};

export default function TransactionDetail(props: Props) {
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title={"Device"}
        description={"a"}
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
            title={"12345"}
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
            title={"12345"}
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
              { title: "100%", subtitle: "CPU", icon: <ComputerIcon /> },
              { title: "100%", subtitle: "CPU", icon: <ComputerIcon /> },
            ]}
          />
        </Grid>
        <Grid item xs={12}>
          <ResponsiveCard>
            <List>
              <ListItem>
                <ListItemText primary={"Device ID"} secondary={"abc"} />
              </ListItem>

              <ListItem>
                <ListItemText primary={"Device Name"} secondary={"abcde"} />
              </ListItem>

              <ListSubheader>Peers</ListSubheader>
              <ListItem>
                <ListItemAvatar>1</ListItemAvatar>
                <ListItemText primary={"Device IP"} secondary={"abcde"} />
              </ListItem>
            </List>
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
