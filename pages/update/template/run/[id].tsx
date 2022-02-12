// @flow
import * as React from "react";
import { GetServerSideProps } from "next";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import useSWR from "swr";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import ResponsiveCard from "../../../../components/common/ResponsiveCard";
import Spacer from "../../../../components/common/Spacer";
import PageHeader from "../../../../components/common/PageHeader";
import Form from "@rjsf/bootstrap-4";
import { ImageField } from "../../../../components/installation/DockerImageField";
import "bootstrap/dist/css/bootstrap.min.css";
import join from "url-join";
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
import { configs, interfaces, utils } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { getAxiosClient } from "../../../../internal/const/defaultValues";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { Configurations } from "@etherdata-blockchain/common/src/configs/configurations";
import {
  jsonSchema,
  UISchema,
} from "../../../../internal/handlers/update_template_handler";
import { useRouter } from "next/dist/client/router";

type Props = {
  updateTemplate: interfaces.db.UpdateTemplateWithDockerImageDBInterface;
};

/**
 * Run template
 * @param props
 * @constructor
 */
export default function Run(props: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { data, error, isValidating } = useSWR<
    interfaces.db.ExecutionPlanDBInterface[]
  >(
    { id: props.updateTemplate._id },
    async ({ id }) => {
      const data = await getAxiosClient().get(
        join(Routes.executionPlanAPIGet, id)
      );
      return data.data;
    },
    { refreshInterval: Configurations.defaultRefreshInterval }
  );

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
                maxHeight: `calc(100vh - ${configs.Configurations.appbarHeight}px)`,
                overflowY: "scroll",
                width: "100%",
              }}
            >
              <Stack spacing={2}>
                <Collapse
                  in={data === undefined && error === undefined}
                  mountOnEnter
                  unmountOnExit
                >
                  <LinearProgress />
                </Collapse>

                <Collapse in={error !== undefined} mountOnEnter unmountOnExit>
                  <Typography>{`${error}`}</Typography>
                </Collapse>

                <Collapse mountOnEnter unmountOnExit in={data !== undefined}>
                  <Timeline position={"right"}>
                    {data?.map((step, i) => (
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
                          {i < data?.length - 1 && (
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
                </Collapse>

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
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const id = context.query.id;
  const updateScriptPlugin = new dbServices.UpdateTemplateService();

  const [foundTemplate] = await Promise.all([
    updateScriptPlugin.getUpdateTemplateWithDockerImage(id as string),
  ]);

  if (!foundTemplate) {
    return {
      notFound: true,
    };
  }

  const data: Props = {
    updateTemplate: foundTemplate!,
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
