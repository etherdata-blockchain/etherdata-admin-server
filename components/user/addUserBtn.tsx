// @flow
import * as React from "react";
import styles from "../../styles/Transactions.module.css";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { Formik } from "formik";

type Props = {};

export function AddUserBtn(props: Props) {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <Button
        variant={"outlined"}
        color={"primary"}
        className={styles.sendBtn}
        onClick={() => setShow(true)}
      >
        Add User
      </Button>
      <Dialog open={show} fullWidth onClose={() => setShow(false)}>
        <DialogTitle>Add New User</DialogTitle>

        <Formik
          initialValues={{ id: "0" }}
          onSubmit={(v) => {}}
          validate={(values) => {
            return {
              to: "Required",
              amount: ">0",
            };
          }}
        >
          {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Stack spacing={2}>
                  {errors &&
                    Object.entries(errors).map(([key, value], index) => (
                      <Alert severity={"error"} key={`${key}`}>
                        Field {key}: {value}
                      </Alert>
                    ))}
                  <TextField
                    variant={"filled"}
                    label={"UserID"}
                    value={values.id}
                    name={"id"}
                    onChange={handleChange}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShow(false)}>Cancel</Button>
                <Button type={"submit"}>Add</Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
}
