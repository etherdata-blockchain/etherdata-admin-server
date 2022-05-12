// @flow
import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from "@mui/material";
import { MuiForm5 } from "@rjsf/material-ui";
import { schema } from "../../internal/handlers/add_item_handler";
import { ReactJsonFormContext } from "../../model/ReactJsonFormProvider";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { configs } from "@etherdata-blockchain/common";
import { useRouter } from "next/dist/client/router";

type Props = {
  userId: string;
  onClose(): void;
  open: boolean;
};

/**
 * Add device dialog
 * @param props
 * @constructor
 */
export function AddDeviceDialog(props: Props) {
  const { setIsLoading, formButton, submit, isLoading } =
    React.useContext(ReactJsonFormContext);
  const router = useRouter();

  const onSubmit = React.useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      await getAxiosClient().post(configs.Routes.addItem, {
        ...data,
        owner_id: props.userId,
      });
      props.onClose();
      router.reload();
    } catch (e) {
      window.alert(`${e}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth>
      <DialogTitle>Create a new device</DialogTitle>
      <DialogContent>
        {isLoading && <LinearProgress />}
        <MuiForm5
          schema={schema}
          onSubmit={async (data) => {
            await onSubmit(data.formData);
          }}
        >
          <button ref={formButton} type="submit" style={{ display: "none" }} />
        </MuiForm5>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.onClose()}>Close</Button>
        <Button
          onClick={() => {
            submit();
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
