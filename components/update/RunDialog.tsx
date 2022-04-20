// @flow
import * as React from "react";
import { DeviceIdsAutoComplete } from "./DeviceIdsAutoComplete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { utils } from "@etherdata-blockchain/common";
import { getAxiosClient } from "../../internal/const/defaultValues";
import join from "@etherdata-blockchain/url-join";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { LoadingButton } from "@mui/lab";

type Props = {
  templateId: string;
  defaultTargetDeviceIds: string[];
  open: boolean;
  onClose(): void;
};

/**
 * Run template dialog will ask user enter target device ids and
 * run it.
 * @param props
 * @constructor
 */
export function RunDialog(props: Props) {
  const { defaultTargetDeviceIds, open, onClose, templateId } = props;
  const [selectedDeviceIds, setSelectedDeviceIds] = React.useState(
    defaultTargetDeviceIds
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const runPlan = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await utils.sleep(1000);
      await getAxiosClient().post(
        join(Routes.updateTemplateAPIRun, templateId),
        {
          targetDeviceIds: selectedDeviceIds,
        }
      );
    } catch (err) {
      window.alert(`Cannot run due to ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth>
      <DialogTitle>Run Update Template</DialogTitle>
      <DialogContent>
        <DeviceIdsAutoComplete
          id={"device-id"}
          minRows={4}
          defaultValues={defaultTargetDeviceIds}
          placeholder={"Device IDs"}
          label={"Device IDs"}
          readonly={false}
          onAdd={async (index, content) => {
            selectedDeviceIds.push(content);
            setSelectedDeviceIds(selectedDeviceIds);
          }}
          onDelete={async (index) => {
            selectedDeviceIds.splice(index, 1);
            setSelectedDeviceIds(selectedDeviceIds);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <LoadingButton
          loading={isLoading}
          onClick={async () => {
            await runPlan();
            onClose();
          }}
        >
          Run
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
