// @flow
import * as React from "react";
import { Alert, Box, Card, CardContent, List, Typography } from "@mui/material";
import useSWR from "swr";
import { getAxiosClient } from "../../internal/const/defaultValues";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { configs, enums, interfaces } from "@etherdata-blockchain/common";
import { schema } from "@etherdata-blockchain/storage-model";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

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
                <Typography gutterBottom>{r.createdAt}</Typography>
                <Typography variant={"subtitle1"}>
                  {r.from} <ChevronRightIcon /> {r.targetDeviceId}
                </Typography>
                <Typography>{JSON.stringify(r.task)}</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </List>
    </Box>
  );
}
