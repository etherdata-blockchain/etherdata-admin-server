// @flow
import * as React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import useSWR from "swr";
import { getAxiosClient } from "../../internal/const/defaultValues";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  configs,
  enums,
  interfaces,
  utils,
} from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import DoneIcon from "@mui/icons-material/Done";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

type Props = {};

/**
 * Pending Job Pending Panel
 * @param props
 * @constructor
 */
export function PendingJobPanel(props: Props) {
  const { data, error } = useSWR<
    interfaces.PaginationResult<schema.IPendingJob<enums.AnyValueType>>
  >(
    "jobs",
    async () => {
      const data = await getAxiosClient().get(Routes.pendingJobsAPIGet);
      return data.data;
    },
    { refreshInterval: configs.Configurations.defaultRefreshInterval }
  );

  return (
    <Box width={configs.Configurations.defaultMessagePanelWidth}>
      <List>
        {error && <Alert severity={"error"}>{`${error}`}</Alert>}
        {data?.results?.map((r) => (
          <Box key={r._id} p={2}>
            <Card>
              <CardContent>
                <Stack direction={"row"} spacing={1}>
                  <Typography gutterBottom>{r.createdAt}</Typography>
                  <div>
                    {r.retrieved ? (
                      <Tooltip title={"Retrieved"}>
                        <Chip
                          size={"small"}
                          label={<DoneIcon />}
                          color={"success"}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title={"Pending"}>
                        <Chip
                          size={"small"}
                          label={<MoreHorizIcon />}
                          color={"warning"}
                        />
                      </Tooltip>
                    )}
                  </div>
                </Stack>

                <Stack direction={"row"} spacing={1}>
                  <Chip label={`${r.task.type}`} color={"success"} />
                  <Chip
                    label={
                      <Stack direction={"row"} alignItems={"center"}>
                        {r.from} <ChevronRightIcon /> {r.targetDeviceId}
                      </Stack>
                    }
                  />
                </Stack>
                <List>
                  {utils
                    .objectExpand(r.task.value, [])
                    .map(({ key, value }, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={key} secondary={value} />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        ))}
      </List>
    </Box>
  );
}
