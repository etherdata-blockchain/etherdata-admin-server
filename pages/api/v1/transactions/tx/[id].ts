// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { BlockTransactionString, Transaction } from "web3-eth";
import Web3 from "web3";

type Data = {
  transactionId: string | undefined;
  status: string;
  transactionDetail: Transaction | undefined;
  block: BlockTransactionString | undefined;
};

/***
 * Get transactions details
 * @param req
 * @param res
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let url = process.env.rpc!;
  let id = req.query.id as string | undefined;
  let transaction: Transaction | undefined = undefined;
  let block: BlockTransactionString | undefined = undefined;
  let status = "failed";

  if (id !== undefined) {
    let web3 = new Web3(Web3.givenProvider || url);
    try {
      transaction = await web3.eth.getTransaction(id);
      if (transaction.blockNumber) {
        block = await web3.eth.getBlock(transaction.blockNumber);
      }
      let transactionReceipt = await web3.eth.getTransactionReceipt(id);

      if (transactionReceipt === null) {
        status = "pending";
      } else if (transactionReceipt.status) {
        status = "confirmed";
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }

  let data: Data = {
    block,
    status,
    transactionDetail: transaction,
    transactionId: id,
  };

  res.status(200).json(data);
}
