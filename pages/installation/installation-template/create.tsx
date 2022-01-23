// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import PageHeader from "../../../components/PageHeader";
import Spacer from "../../../components/Spacer";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";
import { UIProviderContext } from "../../model/UIProvider";
import {
  DefaultInstallationScriptTag,
  getAxiosClient,
} from "../../../internal/const/defaultValues";
import { Routes } from "../../../internal/const/routes";
import { Backdrop, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { GetServerSideProps } from "next";
import { Configurations } from "../../../internal/const/configurations";
import { DockerImagePlugin } from "../../../internal/services/dbServices/docker-image-plugin";
import {
  expandImages,
  jsonSchema,
  postprocessData,
} from "../../../internal/services/dbSchema/install-script/install-script-utils";
import { IDockerImage } from "../../../internal/services/dbSchema/docker/docker-image";
import { Form as BForm } from "react-bootstrap";

type Props = {
  expandImages: any[];
  images: IDockerImage[];
};

// eslint-disable-next-line require-jsdoc
export function ImageField(props: any) {
  //TODO: Use auto complete field in the future. Dynamically fetch image with tag
  const { label, id, onChange, placeholder, options, value } = props;
  return (
    <BForm.Group>
      <BForm.Label>{label}</BForm.Label>
      <BForm.Select
        aria-label="Default select example"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option>{placeholder}</option>
        {options.selections.map((v: any, i: number) => (
          <option value={v.tag._id} key={`${id}-${i}`}>
            {v.image.imageName}:{v.tag.tag}
          </option>
        ))}
      </BForm.Select>
    </BForm.Group>
  );
}

/**
 * Installation template page
 * @param{Props} props
 * @constructor
 */
export default function Index({ expandImages, images }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const [formData, setFormData] = React.useState();
  const router = useRouter();

  const submitData = async (data: any) => {
    setIsLoading(true);
    try {
      await getAxiosClient().post(
        Routes.installationTemplatesAPICreate,
        postprocessData(data)
      );
      await router.push(
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
        title={"Installation template"}
        description={`Create a installation template`}
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
          liveValidate={true}
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
  //TODO: Add pagination
  const dockerImagePlugin = new DockerImagePlugin();

  const images = await dockerImagePlugin.list(0, Configurations.numberPerPage);

  const data: Props = {
    images: images?.results ?? [],
    expandImages: expandImages(images?.results ?? []),
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
