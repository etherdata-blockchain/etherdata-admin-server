// @flow
import * as React from "react";
import Box from "@mui/material/Box";
import { IDockerImage } from "../../../internal/services/dbSchema/docker/docker-image";
import PageHeader from "../../../components/PageHeader";
import Spacer from "../../../components/Spacer";
import { GetServerSideProps } from "next";
import { DockerImagePlugin } from "../../../internal/services/dbServices/docker-image-plugin";
import { Configurations } from "../../../internal/const/configurations";
import { getSchemaWithDockerImages } from "../../../internal/services/dbSchema/install-script/install-script-utils";
import Form from "@rjsf/bootstrap-4";
import "bootstrap/dist/css/bootstrap.min.css";

type Props = {
  images: IDockerImage[];
};

/**
 * Installation related pages
 * @param props
 * @constructor
 */
export default function Index({ images }: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
        <Form schema={getSchemaWithDockerImages(images)} />
      </Box>
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
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
