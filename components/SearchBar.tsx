import React from "react";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import StorageIcon from "@material-ui/icons/Storage";
import { useRouter } from "next/dist/client/router";
import Web3 from "web3";
import {
  AlertTitle,
  CircularProgress,
  Snackbar,
  TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/core";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  const search = React.useCallback(async () => {}, [value]);

  return (
    <div
      style={{
        padding: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: `80vw`,
      }}
    >
      <InputBase
        style={{
          flex: 5,
        }}
        placeholder="Search by transaction or address"
        inputProps={{ "aria-label": "Search" }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            await search();
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}
