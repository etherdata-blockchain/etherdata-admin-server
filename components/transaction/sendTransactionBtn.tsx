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
} from "@material-ui/core";
import { Formik } from "formik";

type Props = {};

export function SendTransactionBtn(props: Props) {
  const [show, setShow] = React.useState(false);
  return (
    <div>
      <Button
        variant={"outlined"}
        color={"primary"}
        className={styles.sendBtn}
        onClick={() => setShow(true)}
      >
        Send Transaction
      </Button>
      <Dialog open={show} fullWidth onClose={() => setShow(false)}>
        <DialogTitle>Send Transaction</DialogTitle>

        <Formik
          initialValues={{ to: "", amount: 0 }}
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
                    label={"To"}
                    value={values.to}
                    name={"to"}
                    onChange={handleChange}
                  />

                  <TextField
                    variant={"filled"}
                    label={"Amount"}
                    value={values.amount}
                    name={"amount"}
                    onChange={handleChange}
                    type={"number"}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button>Cancel</Button>
                <Button type={"submit"}>Send</Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
}
