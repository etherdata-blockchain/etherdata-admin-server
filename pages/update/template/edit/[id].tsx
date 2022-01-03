// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../../components/common/PageHeader";
import Spacer from "../../../../components/common/Spacer";
import Form from "@rjsf/bootstrap-4";

import {
  convertQueryFormatToCreateFormat,
  jsonSchema,
} from "../../../../internal/services/dbSchema/update-template/update_template_utils";
import { UIProviderContext } from "../../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../../internal/const/defaultValues";
import { Routes } from "../../../../internal/const/routes";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { IInstallationTemplate } from "../../../../internal/services/dbSchema/install-script/install-script";
import { ImageField } from "../../../../components/installation/DockerImageField";
import {
  IUpdateScriptWithDockerImage,
  UpdateScriptPlugin,
} from "../../../../internal/services/dbServices/update-script-plugin";
import "bootstrap/dist/css/bootstrap.min.css";
import { IUpdateTemplate } from "../../../../internal/services/dbSchema/update-template/update_template";

type Props = {
  updateTemplate: IUpdateScriptWithDockerImage;
};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({ updateTemplate }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(updateTemplate);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();
  const url = `${Routes.installationTemplatesAPIEdit}/${updateTemplate._id}`;

  const submitData = async (data: IUpdateTemplate) => {
    setIsLoading(true);
    try {
      const patchData = convertQueryFormatToCreateFormat(data);
      await getAxiosClient().patch(url, patchData);
      await router.push(
        `${Routes.installation}?index=${DefaultInstallationScriptTag.installationTemplate}`
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
      await router.replace(
        `${Routes.installation}?index=${DefaultInstallationScriptTag.installationTemplate}`
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
        title={`Update template ${updateTemplate.name}`}
        description={`Update installation template`}
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
          liveValidate={true}
          onChange={(value) => {
            setFormData(value.formData);
          }}
          onSubmit={async (data) => {
            await submitData(data.formData);
          }}
          widgets={{ image: ImageField }}
          uiSchema={{
            services: {
              items: {
                service: {
                  image: {
                    "ui:widget": "image",
                  },
                },
              },
            },
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
  const id = context.query.id;
  const updateScriptPlugin = new UpdateScriptPlugin();

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
