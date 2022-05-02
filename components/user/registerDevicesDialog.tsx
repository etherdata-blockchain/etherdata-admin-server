// @flow
import * as React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from "@mui/material";
import { DeviceIdsAutoComplete } from "../common/fields/DeviceIdsAutoComplete";
import { getAxiosClient } from "../../internal/const/defaultValues";
import queryString from "query-string";
import { Routes } from "@etherdata-blockchain/common/src/configs/routes";
import { LoadingButton } from "@mui/lab";

type Props = {
  userId: string;
  onClose(): void;
  open: boolean;
};

/**
 * Dialog for registering devices
 * @param open
 * @param onClose
 * @param userId
 * @constructor
 */
export function RegisterDevicesDialog({ open, onClose, userId }: Props) {
  const [deviceIds, setDeviceIds] = React.useState<string[]>();
  const [loading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState();

  React.useEffect(() => {
    getAxiosClient()
      .get(
        queryString.stringifyUrl({
          url: Routes.devicesIdByUser,
          query: { user: encodeURI(userId) },
        })
      )
      .then((resp) => {
        setDeviceIds(resp.data.ids);
      })
      .catch((e) => setError(e));
  }, [userId]);

  const updateOwner = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await getAxiosClient(userId).post(Routes.editOwner, {
        devices: deviceIds,
      });
      onClose();
    } catch (err) {
      window.alert(JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  }, [userId, deviceIds]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Register devices with user</DialogTitle>
      <DialogContent>
        {error && <Alert>{JSON.stringify(error)}</Alert>}
        {deviceIds === undefined && error === undefined && <LinearProgress />}
        {deviceIds && (
          <DeviceIdsAutoComplete
            id={"device ids"}
            defaultValues={deviceIds}
            placeholder={"Enter your"}
            label={"Device ids"}
            readonly={false}
            onAdd={async (index, content) => {
              if (deviceIds) {
                const part1 = deviceIds.slice(0, index);
                const part2 = deviceIds.slice(index);
                part1.push(content);
                setDeviceIds([...part1, ...part2]);
              }
            }}
            onDelete={async (index) => {
              deviceIds?.splice(index, 1);
              setDeviceIds(deviceIds);
            }}
            onClear={async () => {
              setDeviceIds([]);
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <LoadingButton
          loading={loading}
          onClick={async () => {
            await updateOwner();
          }}
        >
          OK
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
