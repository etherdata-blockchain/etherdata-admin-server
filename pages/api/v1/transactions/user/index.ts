import type { NextApiRequest, NextApiResponse } from "next";
import { TransactionSummary } from "../../../../../server/utils/node_data";
import Web3 from "web3";
import { Config } from "../../../../../server";
import { TransactionClient } from "../../../../../server/transaction/transaction";
import Logger from "../../../../../server/logger";

type Data = {
  userId: string;
  balance: string;
  transactions: TransactionSummary[];
};

/**
 * Get user's details
 *4
 * {
 *     "userId": string;
 *     "balance": string;
 *     "transactions: TransactionSummary[]
 * }
 *
 * If id is not found, will return 500 error.
 * If userId is not provided, will return "0" for balance and empty list of transactions
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.json(req.body);
}
