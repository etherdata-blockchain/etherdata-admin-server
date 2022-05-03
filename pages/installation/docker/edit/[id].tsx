// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../../components/common/PageHeader";
import Spacer from "../../../../components/common/Spacer";
import { UIProviderContext } from "../../../../model/UIProvider";
import { getAxiosClient } from "../../../../internal/const/defaultValues";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import { dbServices } from "@etherdata-blockchain/services";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { jsonSchema } from "../../../../internal/handlers/docker_image_handler";
import Logger from "@etherdata-blockchain/logger";
import { interfaces } from "@etherdata-blockchain/common";
import { MuiForm5 } from "@rjsf/material-ui";

type Props = {
  dockerImage: interfaces.db.DockerImageDBInterface;
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
  const url = `${Routes.dockerImageAPICreate}/${(dockerImage as any)._id}`;

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
      <PaddingBox>
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "background.paper",
            display: "flex",
            padding: 3,
          }}
        >
          <MuiForm5
            schema={jsonSchema}
            formData={formData}
            onChange={(v: any) => setFormData(v.formData)}
            onSubmit={async (data: any) => {
              await submitData(data.formData);
            }}
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
  Logger.info("Getting docker");
  const id = context.query.id;
  const dockerPlugin = new dbServices.DockerImageService();
  const foundImage = await dockerPlugin.get(id as string);
  if (!foundImage) {
    return {
      notFound: true,
    };
  }

  const data: Props = {
    dockerImage: foundImage as any,
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
