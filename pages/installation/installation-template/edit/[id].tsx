// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../../components/PageHeader";
import Spacer from "../../../../components/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
<<<<<<< HEAD
import { jsonSchema } from "../../../../internal/services/dbSchema/install-script/static-node-utils";
=======
import {
  expandImages,
  jsonSchema,
  postprocessData,
  preprocessData,
} from "../../../../internal/services/dbSchema/install-script/install-script-utils";
>>>>>>> upstream/dev
import { UIProviderContext } from "../../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../../internal/const/defaultValues";
import { Routes } from "../../../../internal/const/routes";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
<<<<<<< HEAD
import { IStaticNode } from "../../../../internal/services/dbSchema/install-script/static-node";
import { StaticNodePlugin } from "../../../../internal/services/dbServices/static-node-plugin";

type Props = {
  staticNode: IStaticNode;
=======
import { InstallationPlugin } from "../../../../internal/services/dbServices/installation-plugin";
import { IInstallationTemplate } from "../../../../internal/services/dbSchema/install-script/install-script";
import { ImageField } from "../create";
import { DockerImagePlugin } from "../../../../internal/services/dbServices/docker-image-plugin";
import { Configurations } from "../../../../internal/const/configurations";

type Props = {
  installationTemplate: IInstallationTemplate;
  expandImages: any[];
>>>>>>> upstream/dev
};

/**
 * Installation related pages
 * @param{Props} props
 * @constructor
 */
<<<<<<< HEAD
export default function Index({ staticNode }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();
  const url = `${Routes.staticNodeAPIEdit}/${staticNode._id}`;
=======
export default function Index({ installationTemplate, expandImages }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(
    preprocessData(installationTemplate)
  );
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();
  const url = `${Routes.installationTemplatesAPIEdit}/${installationTemplate._id}`;
>>>>>>> upstream/dev

  const submitData = async (data: any) => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      await getAxiosClient().patch(url, data);
=======
      await getAxiosClient().patch(url, postprocessData(data));
>>>>>>> upstream/dev
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
<<<<<<< HEAD
        title={"Static Node"}
        description={`Update Static Node`}
=======
        title={`Update template ${installationTemplate.template_tag}`}
        description={`Update installation template`}
>>>>>>> upstream/dev
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
<<<<<<< HEAD
          formData={staticNode}
          onSubmit={async (data) => {
            await submitData(data.formData);
          }}
=======
          formData={formData}
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
                    "ui:options": {
                      selections: expandImages,
                    },
                  },
                },
              },
            },
          }}
>>>>>>> upstream/dev
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
<<<<<<< HEAD
  const staticNodePlugin = new StaticNodePlugin();
  const foundImage = await staticNodePlugin.get(id as string);
  if (!foundImage) {
=======
  const installationPlugin = new InstallationPlugin();
  const dockerPlugin = new DockerImagePlugin();

  const [foundTemplate, images] = await Promise.all([
    installationPlugin.get(id as string),
    dockerPlugin.list(0, Configurations.numberPerPage),
  ]);

  if (!foundTemplate) {
>>>>>>> upstream/dev
    return {
      notFound: true,
    };
  }

  const data: Props = {
<<<<<<< HEAD
    staticNode: foundImage,
=======
    installationTemplate: foundTemplate,
    expandImages: expandImages(images?.results ?? []),
>>>>>>> upstream/dev
  };
  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
