// @flow
import * as React from "react";
import { UserInfoPanel } from "../../common/panels/UserInfoPanel";
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
import { UserInfoContext } from "../../../model/UserInfoProvider";
import { getAxiosClient } from "../../../internal/const/defaultValues";
import urlJoin from "@etherdata-blockchain/url-join";
import { useRouter } from "next/dist/client/router";

type Props = {
  userInfo: interfaces.db.StorageUserDBInterface;
};

/**
 * Will perform update operation for user info
 * @param props
 * @constructor
 */
export function UpdateUserInfoPanel(props: Props) {
  const { isLoading, submit } = React.useContext(UserInfoContext);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const updateData = React.useCallback(
    async (data: interfaces.db.StorageUserDBInterface) => {
      await getAxiosClient().patch(
        urlJoin(configs.Routes.editOwner, props.userInfo.user_id),
        data
      );
    },
    []
  );

  const deleteData = React.useCallback(async () => {
    setIsDeleting(true);
    try {
      await getAxiosClient().delete(
        urlJoin(configs.Routes.editOwner, props.userInfo.user_id)
      );
      await router.replace("/user");
    } catch (e) {
      window.alert(`${e}`);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const refresh = React.useCallback(
    async (data: interfaces.db.StorageUserDBInterface) => {
      await router.replace("user/", data.user_id);
    },
    []
  );

  return (
    <div>
      <ResponsiveCard title={"Update User info"}>
        <UserInfoPanel
          onClose={async (data) => {
            await refresh(data);
          }}
          onSubmit={async (data) => {
            await updateData(data);
          }}
          userInfo={{ ...props.userInfo }}
        />
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
          Are you sure you want to delete this user?
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
