// @flow
import * as React from "react";
import { GetServerSideProps } from "next";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import ResponsiveCard from "../../../../components/common/ResponsiveCard";
import Spacer from "../../../../components/common/Spacer";
import PageHeader from "../../../../components/common/PageHeader";
import Form from "@rjsf/bootstrap-4";
import { ImageField } from "../../../../components/installation/DockerImageField";
import "bootstrap/dist/css/bootstrap.min.css";
import join from "@etherdata-blockchain/url-join";
import { Clear, Done, PlayCircle } from "@mui/icons-material";
import {
  LoadingButton,
  Timeline,
  TimelineConnector,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import {
  configs,
  enums,
  interfaces,
  utils,
} from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { getAxiosClient } from "../../../../internal/const/defaultValues";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import {
  jsonSchema,
  UISchema,
} from "../../../../internal/handlers/update_template_handler";
import { useRouter } from "next/dist/client/router";
import { socket } from "../../../model/DeviceProvider";
import { addPendingPlans } from "../../../api/v1/update-template/execution-plan/[id]";

type Props = {
  updateTemplate: interfaces.db.UpdateTemplateWithDockerImageDBInterface;
  executionPlans: interfaces.db.ExecutionPlanDBInterface[];
};

/**
 * Run template
 * @param props
 * @constructor
 */
export default function Run(props: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [executionPlans, setExecutionPlans] = React.useState<
    interfaces.db.ExecutionPlanDBInterface[]
  >(props.executionPlans);

  React.useEffect(() => {
    socket?.emit(enums.SocketIOEvents.joinRoom, props.updateTemplate._id);

    socket?.on(enums.SocketIOEvents.executionPlan, async (data) => {
      try {
        const executionPlans = await getAxiosClient().get(
          join(Routes.executionPlanAPIGet, props.updateTemplate._id)
        );
        setExecutionPlans(executionPlans.data);
        setError(undefined);
      } catch (e) {
        setError(`${e}`);
      }
    });

    return () => {
      socket?.emit(enums.SocketIOEvents.leaveRoom, props.updateTemplate._id);
    };
  }, []);

  const runPlan = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await utils.sleep(1000);
      await getAxiosClient().post(
        join(Routes.updateTemplateAPIRun, props.updateTemplate._id)
      );
    } catch (err) {
      window.alert(`Cannot run due to ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [props.updateTemplate]);

  return (
    <div>
      <PageHeader
        title={`Run template ${props.updateTemplate.name}`}
        description={"Running template"}
        action={
          <Button
            onClick={() =>
              router.push(
                join(Routes.updateTemplateEdit, props.updateTemplate._id)
              )
            }
          >
            Edit
          </Button>
        }
      />
      <Spacer height={20} />
      <PaddingBox>
        <Grid container spacing={5}>
          <Grid item md={6}>
            <ResponsiveCard
              title={"Template overview"}
              style={{
                maxHeight: `calc(100vh - ${configs.Configurations.appbarHeight}px)`,
                overflow: "scroll",
              }}
              containerStyle={{
                position: "sticky",
                top: configs.Configurations.appbarHeight + 10,
              }}
            >
              <Form
                schema={jsonSchema}
                formData={props.updateTemplate}
                liveValidate={true}
                widgets={{ image: ImageField }}
                uiSchema={UISchema}
                readonly
              />
            </ResponsiveCard>
          </Grid>
          <Grid item md={6}>
            <ResponsiveCard
              title={"Status"}
              style={{
                overflowY: "scroll",
                width: "100%",
              }}
            >
              <Stack spacing={2}>
                <Collapse in={error !== undefined}>
                  <Alert severity={"error"}>{error}</Alert>
                </Collapse>
                <Timeline position={"right"}>
                  {executionPlans.map((step, i) => (
                    <TimelineItem key={i}>
                      <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot
                          color={
                            step.isDone
                              ? step.isError
                                ? "error"
                                : "success"
                              : "grey"
                          }
                        >
                          {step.isDone ? (
                            step.isError ? (
                              <Clear />
                            ) : (
                              <Done />
                            )
                          ) : (
                            <CircularProgress size={25} color={"inherit"} />
                          )}
                        </TimelineDot>
                        {i < executionPlans.length - 1 && (
                          <TimelineConnector sx={{ minHeight: 80 }} />
                        )}
                      </TimelineSeparator>
                      <TimelineOppositeContent sx={{ textAlign: "left" }}>
                        <Card variant={"outlined"}>
                          <CardContent>
                            <Typography variant={"subtitle1"}>
                              {step.name}
                            </Typography>
                            <Typography variant={"caption"}>
                              {step.createdAt}
                            </Typography>
                            <Typography style={{ wordWrap: "break-word" }}>
                              {step.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </TimelineOppositeContent>
                    </TimelineItem>
                  ))}
                </Timeline>

                <Divider>OR Run with new plan</Divider>
                <Box
                  alignItems={"center"}
                  justifyContent={"center"}
                  display={"flex"}
                >
                  <LoadingButton
                    loading={isLoading}
                    onClick={runPlan}
                    size={"large"}
                    variant="contained"
                    endIcon={<PlayCircle />}
                  >
                    Run Plan
                  </LoadingButton>
                </Box>
              </Stack>
            </ResponsiveCard>
          </Grid>
        </Grid>
      </PaddingBox>
      <Spacer height={20} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const id = context.query.id;
  const updateScriptPlugin = new dbServices.UpdateTemplateService();
  const executionPlanService = new dbServices.ExecutionPlanService();
  const pendingJobService = new dbServices.PendingJobService();

  const [foundTemplate, executionPlans] = await Promise.all([
    updateScriptPlugin.getUpdateTemplateWithDockerImage(id as string),
    executionPlanService.getPlans(id as string),
  ]);

  if (!foundTemplate) {
    return {
      notFound: true,
    };
  }

  await addPendingPlans(executionPlans, pendingJobService, id as string);

  const data: Props = {
    updateTemplate: foundTemplate!,
    executionPlans: (executionPlans as any) ?? [],
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
