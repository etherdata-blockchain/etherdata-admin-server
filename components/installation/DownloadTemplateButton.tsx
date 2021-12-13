import React from "react";
import { Button } from "@mui/material";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { Routes } from "../../internal/const/routes";
import { saveAs } from "file-saver";
import { LoadingButton } from "@mui/lab";

interface Props {
  templateName: string;
}

/**
 * Download Template by template name
 * @param{string} templateName
 * @constructor
 */
function DownloadTemplateButton({ templateName }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <LoadingButton
      loading={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          const resp = await getAxiosClient().post(
            Routes.installationTemplateAPIDownload,
            {
              template: templateName,
            },
            { responseType: "blob" }
          );
          saveAs(resp.data, `${templateName}.zip`);
        } catch (e) {
          window.alert(`${e}`);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      Download
    </LoadingButton>
  );
}

export default DownloadTemplateButton;
