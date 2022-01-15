// @flow
import * as React from "react";
import { Alert, Box, Card, CardContent, List, Typography } from "@mui/material";
import { Configurations } from "../../internal/const/configurations";
import useSWR from "swr";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { Routes } from "../../internal/const/routes";
import { PaginationResult } from "../../internal/const/common_interfaces";
import {
  AnyValueType,
  IPendingJob,
} from "../../internal/services/dbSchema/queue/pending-job";
import { BiRightArrow } from "react-icons/all";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type Props = {};

/**
 * Pending Job Pending Panel
 * @param props
 * @constructor
 */
export function PendingJobPanel(props: Props) {
  const { data, error } = useSWR<PaginationResult<IPendingJob<AnyValueType>>>(
    "jobs",
    async () => {
      const data = await getAxiosClient().get(Routes.pendingJobsAPIGet);
      return data.data;
    },
    { refreshInterval: Configurations.defaultRefreshInterval }
  );

  return (
    <Box width={Configurations.defaultMessagePanelWidth}>
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
