// @flow
import * as React from "react";
import { Formik } from "formik";
import {
  Button,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@material-ui/core";
import axios from "axios";
import { UIProviderContext } from "../../pages/model/UIProvider";
import { useRouter } from "next/dist/client/router";

type Props = {
  user: string;
};

export function GeneralPanel({ user }: Props) {
  const { showSnackBarMessage } = React.useContext(UIProviderContext);
  const router = useRouter();

  return (
    <div style={{ width: "100%" }}>
      <Formik
        initialValues={{ user }}
        onSubmit={async (values) => {
          try {
            let result = await axios.post("/api/v1/device/register/", {
              device: router.query.deviceId,
              user: values.user,
            });
            showSnackBarMessage("User has been updated");
          } catch (err) {
            showSnackBarMessage(err.toString());
          }
        }}
      >
        {({ handleSubmit, handleChange, values, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Typography variant={"h6"}>Register device</Typography>
            {isSubmitting && <LinearProgress />}
            <TextField
              label={"User"}
              variant={"standard"}
              fullWidth
              value={values.user}
              name={"user"}
              onChange={handleChange}
            />

            <Stack alignItems={"flex-end"}>
              <Button type={"submit"}>Submit</Button>
            </Stack>
          </form>
        )}
      </Formik>
    </div>
  );
}
