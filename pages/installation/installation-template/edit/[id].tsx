// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../../components/common/PageHeader";
import Spacer from "../../../../components/common/Spacer";
import { MuiForm5 } from "@rjsf/material-ui";

import { UIProviderContext } from "../../../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../../internal/const/defaultValues";

import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { ImageField } from "../../../../components/installation/DockerImageField";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import {
  jsonSchema,
  uiSchema,
} from "../../../../internal/handlers/install_script_handler";

type Props = {
  installationTemplate: schema.IInstallationTemplate;
};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({ installationTemplate }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(installationTemplate);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();
  const url = `${Routes.installationTemplatesAPIEdit}/${installationTemplate._id}`;

  const submitData = async (data: schema.IInstallationTemplate) => {
    setIsLoading(true);
    try {
      // console.log(data);
      await getAxiosClient().patch(url, data);
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

  console.log(formData);

  return (
    <div>
      <PageHeader
        title={`Update template ${installationTemplate.template_tag}`}
        description={`Update installation template`}
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
            liveValidate={true}
            onChange={(value: any) => {
              setFormData(value.formData);
            }}
            onSubmit={async (data: any) => {
              await submitData(data.formData);
            }}
            widgets={{ image: ImageField }}
            uiSchema={uiSchema}
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
  const installationService = new dbServices.InstallationService();

  const [foundTemplate] = await Promise.all([
    installationService.getTemplateWithDockerImages(id as string),
  ]);

  if (!foundTemplate) {
    return {
      notFound: true,
    };
  }
  // @ts-ignore
  foundTemplate.services = foundTemplate.services.map((s) => ({
    ...s,
    service: {
      ...s.service,
      image: {
        ...s.service.image,
        // @ts-ignore
        tag: s.service.image.tag._id,
        //@ts-ignore
        image: s.service.image._id,
        tags: [s.service.image.tag],
      },
    },
  }));

  const data: Props = {
    installationTemplate: foundTemplate,
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
