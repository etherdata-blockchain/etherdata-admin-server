import { GetStaticProps } from "next";
import {
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@material-ui/core";
import { Formik } from "formik";
import Spacer from "../components/Spacer";
interface Props {}

export default function Home(props: Props) {
  return (
    <Grid container>
      <Grid xs={8} style={{ backgroundColor: "white", height: "100vh" }} />
      <Grid xs={4}>
        <Stack
          justifyContent={"center"}
          alignContent={"center"}
          style={{ height: "100vh", padding: 10 }}
        >
          <Typography variant={"h6"}>Login</Typography>

          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={(v) => {}}
          >
            {({ values, handleChange, handleSubmit }) => (
              <form>
                <Stack spacing={3}>
                  <TextField
                    variant={"standard"}
                    label={"Email"}
                    name={"email"}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    variant={"standard"}
                    label={"Password"}
                    name={"password"}
                    type={"password"}
                    onChange={handleChange}
                    fullWidth
                  />

                  <Button variant={"contained"}>Login</Button>
                  <Spacer height={100} />
                </Stack>
              </form>
            )}
          </Formik>
        </Stack>
      </Grid>
    </Grid>
  );
}
