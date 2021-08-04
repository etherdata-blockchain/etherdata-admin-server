import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from "@material-ui/core";
import SearchBar from "../components/SearchBar";
import { GetStaticProps } from "next";
import Link from "next/link";
import BlockTimeDisplay from "./components/display/BlockTimeDisplay";
import ActiveNodes from "./components/display/ActiveNodesDisplay";
import CurrentDifficulty from "./components/display/CurrentDifficultyDisplay";
import BlockTimeHistory from "./components/display/BlockTimeHistoryDisplay";
import DifficultyHistory from "./components/display/DifficultyHistoryDisplay";
import ClientsTable from "./components/display/ClientsTableDisplay";
import BlockNumberDisplay from "./components/display/BlockNumberDisplay";
import LastBlockTimeDisplay from "./components/display/LastBlockTimeDisplay";
import PageHeader from "../components/PageHeader";

interface Props {
  documents: {
    title: string;
    tag: string;
    description: string;
    link: string;
  }[];
}

export default function Home(props: Props) {
  const { documents } = props;

  return (
    <div>
      <PageHeader title={"ETDStats"} description={"Welcome to ETD Dashboard"} />
      <div className={styles.centerTitle}>
        <SearchBar />
      </div>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={4} md={4}>
          <BlockTimeDisplay />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <ActiveNodes />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <CurrentDifficulty />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <BlockNumberDisplay />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <LastBlockTimeDisplay />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <CurrentDifficulty />
        </Grid>
        <Grid item xs={12} md={6}>
          <BlockTimeHistory />
        </Grid>
        <Grid item xs={12} md={6}>
          <DifficultyHistory />
        </Grid>
        <Grid item xs={12} md={12}>
          <ClientsTable />
        </Grid>
        {documents.map((d, i) => (
          <Grid item xs={12} md={4} key={`card-${i}`}>
            <Card>
              <CardContent>
                <Typography variant="h6">{d.title}</Typography>
                <Typography>{d.description}</Typography>
              </CardContent>
              <CardActions>
                <Link href={d.link}>
                  <Button>Learn More</Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: {
      documents: [
        {
          title: "Documentations",
          tag: "document",
          description: "ETD Documentations website",
          link: "https://etd.docs.sirileepage.com",
        },
        {
          title: "Project Website",
          tag: "etd",
          description: "ETD Project website",
          link: "https://www.etd.inc/",
        },
      ],
    },
  };
};
