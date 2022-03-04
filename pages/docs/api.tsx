import { GetServerSideProps } from "next";
import { PaddingBox } from "../../components/common/PaddingBox";
import Spacer from "../../components/common/Spacer";
import ResponsiveCard from "../../components/common/ResponsiveCard";
import {
  getSwaggerSpec,
  getUniqueTags,
  SwaggerAPITableOfContentType,
} from "../../internal/handlers/swagger_api_handler";
import PageHeader from "../../components/common/PageHeader";
import { RedocStandalone } from "redoc";
import { Breadcrumbs, Grid, Link } from "@mui/material";
import { Configurations } from "@etherdata-blockchain/common/dist/configs";
import React from "react";
import { StickySideBar } from "../../components/docs/StickySideBar";
import { configs } from "@etherdata-blockchain/common";
import { NavigationBar } from "../../components/docs/navigation_bar";

interface Props {
  spec: any;
  toc: SwaggerAPITableOfContentType;
}

const ApiDoc = ({ spec, toc }: Props) => {
  return (
    <PaddingBox>
      <Spacer height={20} />
      <NavigationBar links={[{ title: "api" }]} />
      <Spacer height={10} />
      <Grid container spacing={2}>
        <Grid item md={3} xs={12}>
          <StickySideBar toc={toc} />
        </Grid>
        <Grid item md={9} xs={12}>
          <ResponsiveCard>
            <PageHeader title={"API Docs"} description={""} />
            <Spacer height={20} />
            <RedocStandalone
              spec={spec}
              options={{
                theme: {
                  sidebar: { width: "0px" },
                  rightPanel: { width: "40%" },
                },
                scrollYOffset: Configurations.appbarHeight + 100,
                nativeScrollbars: true,
              }}
            />
          </ResponsiveCard>
        </Grid>
      </Grid>
      <Spacer height={20} />
    </PaddingBox>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const https =
    ctx.req.headers["x-forwarded-proto"] ||
    ctx.req.headers.referer?.split("://")[0];
  const spec = getSwaggerSpec(`${https}://${ctx.req.headers.host}`);
  const toc = getUniqueTags(spec as any);

  const data = {
    props: {
      spec,
      toc,
    },
  };
  return JSON.parse(JSON.stringify(data));
};

export default ApiDoc;
