import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PageHeader from "../../../../../components/common/PageHeader";
import Spacer from "../../../../../components/common/Spacer";
import { GeneralPanel } from "../../../../../components/device/generalPanel";
import { GetServerSideProps } from "next";

import {
  Admin,
  Clique,
  Debug,
  Etd,
  Json_rpc,
  Json_rpc_methods,
  Miner,
  Personal,
  Real_time,
  Txpool,
} from "@etherdata-blockchain/etherdata-sdk-react";
import { UIProviderContext } from "../../../../../model/UIProvider";
import { DeviceContext, socket } from "../../../../../model/DeviceProvider";
import { DockerPanel } from "../../../../../components/device/dockerPanel";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";

interface Props {
  user: string | null;
  deviceId: string | null;
  device: schema.IDevice | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// eslint-disable-next-line require-jsdoc
export function TabPanel(props: TabPanelProps) {
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

// eslint-disable-next-line require-jsdoc
export function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

// eslint-disable-next-line require-jsdoc
export default function DeviceEditDetail({ user, deviceId, device }: Props) {
  const [value, setValue] = React.useState(0);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const { joinDetail, leaveDetail, sendCommand } =
    React.useContext(DeviceContext);
  const [foundDevice, setFoundDevice] = React.useState<
    schema.IDevice | undefined
  >(undefined);

  React.useEffect(() => {
    console.log("Joining room", deviceId);
    // @ts-ignore
    if (device) joinDetail(deviceId);

    socket?.on("detail-info", (data) => {
      setFoundDevice(data);
    });

    return () => {
      // @ts-ignore
      if (device) leaveDetail(deviceId);
    };
  }, []);

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
      showSnackBarMessage("Sending command " + methodName + " to client");
      const result = await sendCommand(methodName, params);
      return result;
    } catch (err) {
      showSnackBarMessage(`${err}`);
      throw new Error(`${err}`);
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
          <Tab label="Docker" {...a11yProps(1)} />
          <Tab label="Admin" {...a11yProps(2)} />
          <Tab label="Miner" {...a11yProps(3)} />
          <Tab label="JSON RPC Method" {...a11yProps(4)} />
          <Tab label="JSON RPC" {...a11yProps(5)} />
          <Tab label="ETD" {...a11yProps(6)} />
          <Tab label="Debug" {...a11yProps(7)} />
          <Tab label="Clique" {...a11yProps(8)} />
          <Tab label="Personal" {...a11yProps(9)} />
          <Tab label="Realtime" {...a11yProps(10)} />
          <Tab label="TXPool" {...a11yProps(11)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <GeneralPanel user={user ?? ""} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <DockerPanel device={foundDevice} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Admin call={call} />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Miner call={call} />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <Json_rpc_methods call={call} />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <Json_rpc call={call} />
        </TabPanel>
        <TabPanel value={value} index={6}>
          <Etd call={call} />
        </TabPanel>
        <TabPanel value={value} index={7}>
          <Debug call={call} />
        </TabPanel>
        <TabPanel value={value} index={8}>
          <Clique call={call} />
        </TabPanel>
        <TabPanel value={value} index={9}>
          <Personal call={call} />
        </TabPanel>
        <TabPanel value={value} index={10}>
          <Real_time call={call} />
        </TabPanel>
        <TabPanel value={value} index={11}>
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
        device: null,
      },
    };
  }

  const plugin = new dbServices.DeviceRegistrationService();
  const device = await plugin.get(deviceId);

  const props = {
    user: device?.user,
    deviceId: deviceId,
    device: device,
  };
  return {
    props: JSON.parse(JSON.stringify(props)),
  };
};
