// @flow
import * as React from "react";
import { Formik } from "formik";
import {
  Button,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { UIProviderContext } from "../../pages/model/UIProvider";
import { useRouter } from "next/dist/client/router";
import jwt from "jsonwebtoken";
import { realmApp } from "../../pages/_app";

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
            const mongodb = realmApp.currentUser?.mongoClient("mongodb-atlas");
            const devices = mongodb?.db("etd").collection("devices");
            const user = values.user.length > 0 ? values.user : null;
            if (devices) {
              await devices.findOneAndUpdate(
                { id: router.query.deviceId },
                { $set: { user: user } }
              );
            }

            showSnackBarMessage("User has been updated");
          } catch (err) {
            showSnackBarMessage(`${err}`);
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
