// @flow
import * as React from "react";
import { configs, interfaces } from "@etherdata-blockchain/common";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import ResponsiveCard from "../../common/ResponsiveCard";
import { LoadingButton } from "@mui/lab";
import { ReactJsonFormContext } from "../../../model/ReactJsonFormProvider";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import urlJoin from "@etherdata-blockchain/url-join";
import { useRouter } from "next/dist/client/router";
import { MuiForm5 } from "@rjsf/material-ui";
import { schema } from "../../../internal/handlers/add_item_handler";

type Props = {
  itemInfo?: interfaces.db.StorageItemDBInterface;
};

/**
 * Will perform update operation for item info
 * @param props
 * @constructor
 */
export function UpdateItemInfoPanel(props: Props) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { setIsLoading, formButton, submit, isLoading } =
    React.useContext(ReactJsonFormContext);
  const [formData, setFormData] = React.useState(props.itemInfo);

  const updateData = React.useCallback(
    async (data: interfaces.db.StorageUserDBInterface) => {
      await getAxiosClient().patch(
        urlJoin(configs.Routes.editItem, (props.itemInfo! as any)._id),
        data
      );
      router.reload();
    },
    []
  );

  const deleteData = React.useCallback(async () => {
    setIsDeleting(true);
    try {
      await getAxiosClient().delete(
        urlJoin(configs.Routes.editItem, (props.itemInfo! as any)._id)
      );
      await router.replace(`/user/${props.itemInfo!.owner_id}`);
    } catch (e) {
      window.alert(`${e}`);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return (
    <div>
      <ResponsiveCard title={"Update User Info"}>
        <MuiForm5
          schema={schema}
          formData={formData}
          onSubmit={async (data) => {
            await updateData(data.formData);
          }}
        >
          <button ref={formButton} type="submit" style={{ display: "none" }} />
        </MuiForm5>
        <Stack
          direction={"row"}
          alignItems={"end"}
          justifyContent={"end"}
          spacing={2}
        >
          <LoadingButton
            loading={isLoading}
            onClick={() => setShowConfirmation(true)}
          >
            Delete
          </LoadingButton>
          <LoadingButton loading={isLoading} onClick={() => submit()}>
            Update
          </LoadingButton>
        </Stack>
      </ResponsiveCard>
      <Dialog
        fullWidth
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      >
        <DialogTitle>Confirmation on deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this item?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Close</Button>
          <LoadingButton
            loading={isDeleting}
            onClick={async () => await deleteData()}
          >
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
