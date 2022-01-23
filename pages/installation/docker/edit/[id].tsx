// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../../components/PageHeader";
import Spacer from "../../../../components/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
import { jsonSchema } from "../../../../internal/services/dbSchema/docker/docker-image-utils";
import { UIProviderContext } from "../../../model/UIProvider";
import { getAxiosClient } from "../../../../internal/const/defaultValues";
import { Routes } from "../../../../internal/const/routes";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { IDockerImage } from "../../../../internal/services/dbSchema/docker/docker-image";
import { DockerImagePlugin } from "../../../../internal/services/dbServices/docker-image-plugin";
import Logger from "../../../../server/logger";

type Props = {
  dockerImage: IDockerImage;
};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({ dockerImage }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [formData, setFormData] = React.useState(dockerImage);
  const router = useRouter();
  const url = `${Routes.dockerImageAPICreate}/${dockerImage._id}`;

  const submitData = async (data: any) => {
    setIsLoading(true);
    try {
      await getAxiosClient().patch(url, data);
      await router.push(Routes.installation);
    } catch (e) {
      showSnackBarMessage(`${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteData = async () => {
    const confirm = window.confirm("Do you want to delete this document?");
    if (!confirm) {
      return;
    }
    setIsLoading(true);
    try {
      await getAxiosClient().delete(url);
      await router.replace(Routes.installation);
    } catch (e) {
      showSnackBarMessage(`${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={"Installation"}
        description={`Configurations for installation script`}
        action={<Button onClick={deleteData}>Delete</Button>}
      />
      <Spacer height={20} />
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
          formData={formData}
          onChange={(v) => setFormData(v.formData)}
          onSubmit={async (data) => {
            await submitData(data.formData);
          }}
        />
      </Box>
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
  Logger.info("Getting docker");
  const id = context.query.id;
  const dockerPlugin = new DockerImagePlugin();
  const foundImage = await dockerPlugin.get(id as string);
  if (!foundImage) {
    return {
      notFound: true,
    };
  }

  const data: Props = {
    dockerImage: foundImage,
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
