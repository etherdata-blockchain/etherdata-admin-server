// @flow
import * as React from "react";
import { DeviceIdsAutoComplete } from "../common/fields/DeviceIdsAutoComplete";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { getAxiosClient } from "../../internal/const/defaultValues";
import join from "@etherdata-blockchain/url-join";
import { configs } from "@etherdata-blockchain/common";
import { LoadingButton } from "@mui/lab";
import { OwnerIdsAutoComplete } from "../common/fields/OnwerIdAutoComplete";

type Props = {
  templateId: string;
  defaultTargetDeviceIds: string[];
  defaultTargetGroupIds: string[];
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
  const {
    defaultTargetDeviceIds,
    defaultTargetGroupIds,
    open,
    onClose,
    templateId,
  } = props;
  const [selectedDeviceIds, setSelectedDeviceIds] = React.useState(
    defaultTargetDeviceIds
  );
  const [selectedGroupIds, setSelectedGroupIds] = React.useState(
    defaultTargetGroupIds
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const runPlan = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await getAxiosClient().post(
        join(configs.Routes.updateTemplateAPIRun, templateId),
        {
          targetDeviceIds: selectedDeviceIds,
          targetGroupIds: selectedGroupIds,
        }
      );
    } catch (err) {
      window.alert(`Cannot run due to ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [templateId, selectedDeviceIds, selectedGroupIds]);

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth>
      <DialogTitle>Run Update Template</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <DeviceIdsAutoComplete
            id={"device-id"}
            defaultValues={defaultTargetDeviceIds}
            placeholder={"Device IDs"}
            label={"Device IDs"}
            readonly={false}
            onClear={async () => {
              setSelectedDeviceIds([]);
            }}
            onAdd={async (index, content) => {
              selectedDeviceIds.push(content);
              setSelectedDeviceIds(selectedDeviceIds);
            }}
            onDelete={async (index) => {
              selectedDeviceIds.splice(index, 1);
              setSelectedDeviceIds(selectedDeviceIds);
            }}
          />

          <OwnerIdsAutoComplete
            id={"owner-id"}
            defaultValues={selectedGroupIds}
            placeholder={"Target group ids"}
            label={"Target group ids"}
            readonly={false}
            onClear={async () => {
              setSelectedGroupIds([]);
            }}
            onAdd={async (index: number, content: string | null) => {
              selectedGroupIds.push(content as any);
              setSelectedGroupIds(selectedGroupIds);
            }}
            onDelete={async (index: number) => {
              selectedGroupIds.splice(index, 1);
              setSelectedGroupIds(selectedGroupIds);
            }}
          />
        </Stack>
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
