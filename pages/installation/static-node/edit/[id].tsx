import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../../components/common/PageHeader";
import Spacer from "../../../../components/common/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
import { UIProviderContext } from "../../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../../internal/const/defaultValues";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import { dbServices } from "@etherdata-blockchain/services";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { schema } from "@etherdata-blockchain/storage-model";
import { jsonSchema } from "../../../../internal/handlers/static_node_handler";

type Props = {
  staticNode: schema.IStaticNode;
};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({ staticNode }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(staticNode);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();
  const url = `${Routes.staticNodeAPIEdit}/${staticNode._id}`;

  const submitData = async (data: any) => {
    setIsLoading(true);
    try {
      await getAxiosClient().patch(url, data);
      await router.push(
        `${Routes.installation}?index=${DefaultInstallationScriptTag.staticNode}`
      );
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
        title={"Static Node"}
        description={`Update Static Node`}
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

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const id = context.query.id;
  const staticNodePlugin = new dbServices.StaticNodeService();
  const foundImage = await staticNodePlugin.get(id as string);
  if (!foundImage) {
    return {
      notFound: true,
    };
  }

  const data: Props = {
    staticNode: foundImage,
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
