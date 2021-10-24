import { Fade, Grid } from "@mui/material";
import React from "react";

export default function ProgressBar({ length }: { length: number }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c < length) {
          return c + 1;
        } else {
          return 0;
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [length]);

  return (
    <Grid container style={{ width: "100%" }}>
      {Array.from(Array(length).keys()).map((i) => (
        <Fade mountOnEnter unmountOnExit in={i < count} key={`progress-${i}`}>
          <div
            style={{
              width: `${(1 / length) * 100}%`,
              height: 10,
              padding: 2,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </Fade>
      ))}
    </Grid>
  );
}
