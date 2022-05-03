// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../components/common/PageHeader";
import Spacer from "../../../components/common/Spacer";
import { MuiForm5 } from "@rjsf/material-ui";

import { UIProviderContext } from "../../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../internal/const/defaultValues";

import { Backdrop, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { PaddingBox } from "../../../components/common/PaddingBox";
import { jsonSchema } from "../../../internal/handlers/static_node_handler";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

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
            validate={(data: any, errors: any) => {
              if (!data.nodeURL.startsWith("enode://")) {
                errors.addError("Enode URL should start with enode");
              }
              return errors;
            }}
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
