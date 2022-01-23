// @flow
import * as React from "react";
import { GetServerSideProps } from "next";

import {
  Box,
  Collapse,
  Divider,
  LinearProgress,
  Step,
  StepContent,
  StepLabel,
  Stepper,
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
import { PlayCircle } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { interfaces, utils } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { getAxiosClient } from "../../../../internal/const/defaultValues";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { Configurations } from "@etherdata-blockchain/common/src/configs/configurations";
import {
  jsonSchema,
  UISchema,
} from "../../../../internal/handlers/update_template_handler";

type Props = {
  updateTemplate: interfaces.db.UpdateTemplateWithDockerImageDBInterface;
};

/**
 * Run template
 * @param props
 * @constructor
 */
export default function Run(props: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { data, error, isValidating } = useSWR<schema.IExecutionPlan[]>(
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

  const findActiveIndex = React.useCallback(() => {
    if (data === undefined) {
      return 0;
    }
    let index = 0;
    for (const plan of data) {
      if (!plan.isDone) {
        break;
      }
      index += 1;
    }
    return index;
  }, [data]);

  return (
    <div>
      <PageHeader
        title={`Run template ${props.updateTemplate.name}`}
        description={"Running template"}
      />
      <Spacer height={20} />
      <PaddingBox>
        <ResponsiveCard title={"Status"}>
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
            <Stepper activeStep={findActiveIndex()} orientation={"vertical"}>
              {data?.map((plan) => (
                <Step key={plan._id}>
                  <StepLabel>
                    {plan.name} - {plan.createdAt}
                  </StepLabel>
                  <StepContent>
                    <Typography>{plan.description}</Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Collapse>

          <Spacer height={20} />

          <Divider>OR Run with new plan</Divider>
          <Box alignItems={"center"} justifyContent={"center"} display={"flex"}>
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
        </ResponsiveCard>

        <Spacer height={20} />
        <ResponsiveCard title={"Template overview"}>
          <Form
            schema={jsonSchema}
            formData={props.updateTemplate}
            liveValidate={true}
            widgets={{ image: ImageField }}
            uiSchema={UISchema}
            readonly
          />
        </ResponsiveCard>
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
