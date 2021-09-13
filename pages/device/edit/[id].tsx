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
import {
  Admin,
  Txpool,
  Real_time,
  Personal,
  Json_rpc_methods,
  Json_rpc,
  Debug,
  Clique,
  Etd,
  Miner,
} from "etd-react-ui";
import { UIProviderContext } from "../../model/UIProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import ETDProvider, { ETDContext } from "../../model/ETDProvider";
import { DeviceContext } from "../../model/DeviceProvider";

interface Props {
  user: string | null;
  deviceId: string | null;
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
      style={{ width: "80%" }}
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

export default function DeviceEditDetail({ user, deviceId }: Props) {
  const [value, setValue] = React.useState(0);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const { devices, joinDetail, leaveDetail, sendCommand } =
    React.useContext(DeviceContext);

  React.useEffect(() => {
    if (deviceId) {
      joinDetail(deviceId);
    }

    return () => {
      if (deviceId) {
        leaveDetail(deviceId);
      }
    };
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const call = React.useCallback(async ({ methodName, params }: any) => {
    try {
      let result = await sendCommand(methodName, params);
      return result;
    } catch (err) {
      showSnackBarMessage(err.toString());
      throw new Error(err);
    }
  }, []);

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
          <Tab label="Admin" {...a11yProps(1)} />
          <Tab label="Miner" {...a11yProps(2)} />
          <Tab label="JSON RPC Method" {...a11yProps(3)} />
          <Tab label="JSON RPC" {...a11yProps(4)} />
          <Tab label="ETD" {...a11yProps(5)} />
          <Tab label="Debug" {...a11yProps(6)} />
          <Tab label="Clique" {...a11yProps(7)} />
          <Tab label="Personal" {...a11yProps(8)} />
          <Tab label="Realtime" {...a11yProps(9)} />
          <Tab label="TXPool" {...a11yProps(10)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <GeneralPanel user={user ?? ""} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Admin call={call} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Miner call={call} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Json_rpc_methods call={call} />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Json_rpc call={call} />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <Etd call={call} />
        </TabPanel>
        <TabPanel value={value} index={6}>
          <Debug call={call} />
        </TabPanel>
        <TabPanel value={value} index={7}>
          <Clique call={call} />
        </TabPanel>
        <TabPanel value={value} index={8}>
          <Personal call={call} />
        </TabPanel>
        <TabPanel value={value} index={9}>
          <Real_time call={call} />
        </TabPanel>
        <TabPanel value={value} index={10}>
          <Txpool call={call} />
        </TabPanel>
      </Box>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const deviceId = context.query.id as string;
  if (deviceId === undefined || deviceId === "") {
    return {
      props: {
        user: null,
        deviceId: null,
      },
    };
  }

  const plugin = new DeviceRegistrationPlugin();
  let device = await plugin.get(deviceId);
  console.log(device?.user);
  return {
    props: {
      user: device?.user ?? null,
      deviceId: deviceId,
    },
  };
};
