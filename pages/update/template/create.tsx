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
import { PaddingBox } from "../../../components/common/PaddingBox";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import { configs, interfaces } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import {
  jsonSchema,
  UISchema,
} from "../../../internal/handlers/update_template_handler";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { schema } from "@etherdata-blockchain/storage-model";

type Props = {
  images: schema.IDockerImage[];
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

  const submitData = async (data: interfaces.db.UpdateTemplateDBInterface) => {
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
  const dockerImageService = new dbServices.DockerImageService();

  const images = await dockerImageService.list(
    configs.Configurations.defaultPaginationStartingPage,
    configs.Configurations.numberPerPage
  );

  const data: Props = {
    images: images?.results ?? [],
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
