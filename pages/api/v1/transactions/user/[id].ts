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
  let userId = req.query.id as string;
  let pageNumber = req.query.pageNumber as string;
  let pageSize = req.query.pageSize as string;

  let balance = "0";
  let transactions: TransactionSummary[] = [];
  let url = process.env.rpc!;

  if (userId !== undefined) {
    let web3 = new Web3(Web3.givenProvider || url);
    let configuration = Config.fromEnvironment();
    let transaction = new TransactionClient({
      mongodbURL: configuration.mongodbURL,
    });

    try {
      await transaction.connect();
      balance = await web3.eth.getBalance(userId);
      transactions = await transaction.getTransactionsFromAddress(
        userId,
        pageNumber ? parseInt(pageNumber) : undefined,
        pageSize ? parseInt(pageSize) : undefined
      );
    } catch (err) {
      Logger.error(err);
      res.status(500);
      return;
    } finally {
      await transaction.close();
    }
  }

  let data: Data = {
    transactions,
    balance,
    userId,
  };

  res.status(200).json(data);
}
