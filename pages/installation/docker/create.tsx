// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../components/common/PageHeader";
import Spacer from "../../../components/common/Spacer";
import Form from "@rjsf/bootstrap-4";
import { UIProviderContext } from "../../model/UIProvider";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import { Backdrop, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import "bootstrap/dist/css/bootstrap.min.css";
import { PaddingBox } from "../../../components/common/PaddingBox";
import { jsonSchema } from "../../../internal/handlers/install_script_handler";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";

type Props = {};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState();
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
            formData={formData}
            onChange={(v) => setFormData(v.formData)}
            onSubmit={async (data) => {
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
