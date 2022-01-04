// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../components/common/PageHeader";
import Spacer from "../../../components/common/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
import { UIProviderContext } from "../../model/UIProvider";
import { Backdrop, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { Configurations } from "../../../internal/const/configurations";
import { DockerImagePlugin } from "../../../internal/services/dbServices/docker-image-plugin";
import {
  jsonSchema,
  UISchema,
} from "../../../internal/services/dbSchema/update-template/update_template_utils";
import { IDockerImage } from "../../../internal/services/dbSchema/docker/docker-image";
import { PaddingBox } from "../../../components/common/PaddingBox";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import { Routes } from "../../../internal/const/routes";
import { IUpdateTemplate } from "../../../internal/services/dbSchema/update-template/update_template";

type Props = {
  images: IDockerImage[];
};

/**
 * Update template page
 * @param{Props} props
 * @constructor
 */
export default function Index({ images }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [formData, setFormData] = React.useState();
  const router = useRouter();

  const submitData = async (data: IUpdateTemplate) => {
    setIsLoading(true);
    try {
      await getAxiosClient().post(Routes.updateTemplateAPICreate, data);
      await router.push(`${Routes.update}`);
    } catch (e) {
      showSnackBarMessage(`${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={"Update template"}
        description={`Create an update template`}
      />
      <Spacer height={20} />
      <PaddingBox>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "background.paper",
            display: "flex",
            padding: 3,
          }}
        >
          <Form
            schema={jsonSchema}
            liveValidate={true}
            formData={formData}
            onChange={(value) => {
              setFormData(value.formData);
            }}
            onSubmit={async (data) => {
              await submitData(data.formData);
            }}
            uiSchema={UISchema}
          />
        </Box>
      </PaddingBox>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const dockerImagePlugin = new DockerImagePlugin();

  const images = await dockerImagePlugin.list(
    Configurations.defaultPaginationStartingPage,
    Configurations.numberPerPage
  );

  const data: Props = {
    images: images?.results ?? [],
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
