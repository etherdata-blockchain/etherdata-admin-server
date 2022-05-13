// @flow
import * as React from "react";
import styles from "../../styles/Transactions.module.css";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { getAxiosClient } from "../../internal/const/defaultValues";
import { configs } from "@etherdata-blockchain/common";
import { useRouter } from "next/dist/client/router";
import useUserInfoPanel, {
  ReactJsonFormContext,
} from "../../model/ReactJsonFormProvider";
import { UserInfoPanel } from "../common/panels/UserInfoPanel";

type Props = {};

// eslint-disable-next-line require-jsdoc
export function AddUserBtn(props: Props) {
  const [show, setShow] = React.useState(false);
  const { submit, isLoading } = React.useContext(ReactJsonFormContext);
  const router = useRouter();

  return (
    <div>
      <Button
        variant={"contained"}
        color={"primary"}
        className={styles.sendBtn}
        onClick={() => setShow(true)}
      >
        Add User
      </Button>
      <Dialog open={show} fullWidth onClose={() => setShow(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <UserInfoPanel
            onClose={() => {
              setShow(false);
              router.reload();
            }}
            onSubmit={async (data) => {
              await getAxiosClient().post(configs.Routes.addOwner, data);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow(false)}>Close</Button>
          <LoadingButton
            loading={isLoading}
            onClick={() => {
              submit();
            }}
          >
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
