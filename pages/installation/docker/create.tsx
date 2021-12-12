// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../components/PageHeader";
import Spacer from "../../../components/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
import { jsonSchema } from "../../../internal/services/dbSchema/docker/docker-image-utils";
import { UIProviderContext } from "../../model/UIProvider";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import { Routes } from "../../../internal/const/routes";
import { Backdrop, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";

type Props = {};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();

  const submitData = async (data: any) => {
    setIsLoading(true);
    try {
      await getAxiosClient().post(Routes.dockerImageAPICreate, data);
      await router.push(Routes.installation);
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
