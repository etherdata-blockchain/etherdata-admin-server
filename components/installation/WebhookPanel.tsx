import React from "react";
import { Alert, Box } from "@mui/material";
import Form from "@rjsf/bootstrap-4";
import { Form as RForm } from "react-bootstrap";
import join from "@etherdata-blockchain/url-join";
import Spacer from "../common/Spacer";
import { configs } from "@etherdata-blockchain/common";

const { Routes } = configs;
import {
  generateWebhookURL,
  schema,
} from "../../internal/handlers/webhook_url_hanlder";

interface Props {
  host: string;
}

/**
 *
 * @constructor
 */
export default function WebhookPanel({ host }: Props) {
  const [webhookURL, setWebhookURL] = React.useState("");
  const [err, setErr] = React.useState<string>();
  const url = host.startsWith("http")
    ? join(host, Routes.dockerWebhookAPI)
    : join(`${location.protocol}//${host}`, Routes.dockerWebhookAPI);
  const [formData, setFormData] = React.useState();

  React.useEffect(() => {
    const result = generateWebhookURL(
      url,
      configs.Configurations.defaultWebhookUser,
      configs.Configurations.defaultExpireDuration
    );
    setWebhookURL(result[1]!);
  }, []);

  return (
    <Box style={{ minHeight: "85vh", width: "100%" }}>
      {err && <Alert severity="error">{err}</Alert>}
      <Spacer height={20} />
      <Form
        schema={schema}
        formData={formData}
        liveValidate={true}
        showErrorList={false}
        onChange={(e: any) => {
          const data = e.formData;
          const [err, result] = generateWebhookURL(
            url,
            data.user,
            data.expireIn
          );
          if (result) {
            setWebhookURL(result);
          }
          setErr(err);
          setFormData(data);
        }}
      >
        <React.Fragment />
      </Form>
      <RForm.Group>
        <RForm.Label>Webhook URL</RForm.Label>
        <RForm.Control
          type="url"
          value={webhookURL}
          data-testid={"webhook-url"}
        />
      </RForm.Group>
    </Box>
  );
}
