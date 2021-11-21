import React from "react";
import { useRouter } from "next/dist/client/router";
import Web3 from "web3";
import { CircularProgress, InputBase } from "@mui/material";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const search = React.useCallback(async () => {
    setIsLoading(true);
    const isUser = Web3.utils.isAddress(value);
    if (isUser) {
      await router.push("/user/wallet/" + value);
    }
    setIsLoading(false);
  }, [value]);

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
      {isLoading && <CircularProgress size={20} />}
    </div>
  );
}
