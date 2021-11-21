import Web3 from "web3";

export function weiToETD(value: any) {
  try {
    let etdValue = "0";
    if (typeof value === "string" || typeof value === "number") {
      //@ts-ignore
      etdValue = value.toLocaleString("fullwide", { useGrouping: false });
    } else {
      etdValue = value.high.toString();
    }

    return Web3.utils.fromWei(etdValue, "ether");
  } catch (e) {
    console.log(value, e);
    return 0;
  }
}
