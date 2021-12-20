// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../components/PageHeader";
import Spacer from "../../../components/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
import { jsonSchema } from "../../../internal/services/dbSchema/install-script/static-node-utils";
import { UIProviderContext } from "../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../internal/const/defaultValues";
import { Routes } from "../../../internal/const/routes";
import { Backdrop, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";

type Props = {};

/**
 * Static Node creation page
 * @param{Props} props
 * @constructor
 */
export default function Index({}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [formData, setFormData] = React.useState();
  const router = useRouter();

  const submitData = async (data: any) => {
    setIsLoading(true);
    try {
      await getAxiosClient().post(Routes.staticNodeAPICreate, data);
      await router.push(
        `${Routes.installation}?index=${DefaultInstallationScriptTag.staticNode}`
      );
    } catch (e) {
      showSnackBarMessage(`${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={"Static Node"}
        description={`Create a new static node`}
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
          validate={(data, errors) => {
            if (!data.nodeURL.startsWith("enode://")) {
              errors.addError("Enode URL should start with enode");
            }
            return errors;
          }}
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
