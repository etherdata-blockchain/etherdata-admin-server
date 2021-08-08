import * as React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import PageHeader from "../../../components/PageHeader";
import Spacer from "../../../components/Spacer";
import { GeneralPanel } from "../../../components/device/generalPanel";
import { GetServerSideProps } from "next";
import { DeviceRegistrationPlugin } from "../../../server/plugin/plugins/deviceRegistrationPlugin";
interface Props {
  user: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: "60%" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function DeviceDetail({ user }: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div>
      <PageHeader title={"Settings"} description={"Device id"} />
      <Spacer height={20} />
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.paper",
          display: "flex",
        }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="General" {...a11yProps(0)} />
          <Tab label="ETD" {...a11yProps(1)} />
          <Tab label="Miner" {...a11yProps(2)} />
          <Tab label="Net" {...a11yProps(3)} />
          <Tab label="Address" {...a11yProps(4)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <GeneralPanel user={user ?? ""} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>
        <TabPanel value={value} index={3}>
          Item Four
        </TabPanel>
        <TabPanel value={value} index={4}>
          Item Five
        </TabPanel>
      </Box>
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
        user: null,
      },
    };
  }

  const plugin = new DeviceRegistrationPlugin();
  let device = await plugin.get(deviceId);
  console.log(device?.user);
  return {
    props: {
      user: device?.user ?? null,
    },
  };
};
