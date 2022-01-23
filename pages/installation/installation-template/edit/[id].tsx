// @flow
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
import { ImageField } from "../../../../components/installation/DockerImageField";
import { PaddingBox } from "../../../../components/common/PaddingBox";
import { configs } from "@etherdata-blockchain/common";
import { dbServices } from "@etherdata-blockchain/services";
import { schema } from "@etherdata-blockchain/storage-model";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { jsonSchema } from "../../../../internal/handlers/update_template_handler";

type Props = {
  installationTemplate: schema.IInstallationTemplate;
  images: schema.IDockerImage[];
};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
export default function Index({ installationTemplate, images }: Props) {
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
                      "ui:ObjectFieldTemplate": ImageField,
                      "ui:options": {
                        images: images,
                      },
                    },
                  },
                },
              },
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
  const installationService = new dbServices.InstallationService();
  const dockerImageService = new dbServices.DockerImageService();

  const [foundTemplate, images] = await Promise.all([
    installationService.getTemplateWithDockerImages(id as string),
    dockerImageService.list(
      configs.Configurations.defaultPaginationStartingPage,
      configs.Configurations.numberPerPage
    ),
  ]);

  if (!foundTemplate) {
    return {
      notFound: true,
    };
  }

  console.log(foundTemplate.services[0].service.image);
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
    images: images?.results ?? [],
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
