import * as React from "react";
import { GetServerSideProps } from "next";
import { DockerImagePluginPlugin } from "../../../services/dbServices/dockerImagePlugin";
import { Configurations } from "../../../server/const/configurations";
import { IDockerImage } from "../../../services/dbSchema/docker-image";
import PageHeader from "../../../components/PageHeader";
import ResponsiveCard from "../../../components/ResponsiveCard";
import Form from "@rjsf/bootstrap-4";
import { getSchemaWithImage } from "../../../services/dbSchema/docker-compose-schema";
import "bootstrap/dist/css/bootstrap.min.css";
import Spacer from "../../../components/Spacer";

type Props = {
  images: IDockerImage[];
};

/**
 * Installation related pages
 * @param props
 * @constructor
 */
export default function Index({ images }: Props) {
  return (
    <div>
      <PageHeader
        title={"Docker compose"}
        description={"Create a docker compose template"}
      />
      <Spacer height={20} />
      <ResponsiveCard>
        <Form schema={getSchemaWithImage(images)} />
      </ResponsiveCard>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const dockerImagePlugin = new DockerImagePluginPlugin();

  const images = await dockerImagePlugin.list(0, Configurations.numberPerPage);

  const data: Props = {
    images: images ?? [],
  };

  return {
    props: JSON.parse(JSON.stringify(data)),
  };
};
