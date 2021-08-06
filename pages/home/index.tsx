// @flow
import * as React from "react";
import PageHeader from "../../components/PageHeader";
import { Grid, Typography } from "@material-ui/core";
import ResponsiveCard from "../../components/ResponsiveCard";
import Spacer from "../../components/Spacer";
import styles from "../../styles/Home.module.css";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { DurationSelectorBtn } from "../../components/home/DurationSelectorBtn";
type Props = {};

export default function Index(props: Props) {
  return (
    <div>
      <PageHeader title={"Dashboard"} description={"Default Message"} />
      <Spacer height={10} />
      <Grid container spacing={3}>
        <Grid item md={3}>
          <ResponsiveCard
            title={"Active miners"}
            subtitle={"Online Workers"}
            className={styles.dataCard}
          >
            <Typography variant={"h5"}>10/10</Typography>
          </ResponsiveCard>
        </Grid>
        <Grid item md={3}>
          <ResponsiveCard
            title={"# Blocks"}
            subtitle={"Total number of blocks"}
            className={styles.dataCard}
          >
            <Typography variant={"h5"}>10/10</Typography>
          </ResponsiveCard>
        </Grid>
        <Grid item md={3}>
          <ResponsiveCard
            title={"Difficulty"}
            subtitle={"Current difficulty"}
            className={styles.dataCard}
          >
            <Typography variant={"h5"}>10/10</Typography>
          </ResponsiveCard>
        </Grid>

        <Grid item md={3}>
          <ResponsiveCard
            title={"HashRate"}
            subtitle={"Network HashRate"}
            className={styles.dataCard}
          >
            <Typography variant={"h5"}>500</Typography>
          </ResponsiveCard>
        </Grid>
        {/*Second Row*/}
        <Grid item md={8}>
          <ResponsiveCard
            title={"Block Time"}
            subtitle={"History Block Time"}
            action={<DurationSelectorBtn />}
            className={styles.graphCard}
          >
            <Typography variant={"h5"}>500</Typography>
          </ResponsiveCard>
        </Grid>

        <Grid item md={4}>
          <ResponsiveCard
            title={"Block Miners"}
            subtitle={"Block Miners"}
            action={<DurationSelectorBtn />}
            className={styles.graphCard}
          >
            <Typography variant={"h5"}>500</Typography>
          </ResponsiveCard>
        </Grid>

        <Grid item md={4}>
          <ResponsiveCard
            title={"Index"}
            subtitle={"History Block Time"}
            action={<DurationSelectorBtn />}
            className={styles.graphCard}
          >
            <Typography variant={"h5"}>500</Typography>
          </ResponsiveCard>
        </Grid>

        <Grid item md={8}>
          <ResponsiveCard
            title={"Difficulty"}
            subtitle={"Block Miners"}
            className={styles.graphCard}
          >
            <Typography variant={"h5"}>500</Typography>
          </ResponsiveCard>
        </Grid>
      </Grid>
    </div>
  );
}
