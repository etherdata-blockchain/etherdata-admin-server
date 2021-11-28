/**
 * Create a user object for mongoose ORM.
 *
 * This file contains the user dbSchema for mongodb user collection
 */
import mongoose, { Document, model, Schema } from "mongoose";

export interface ITransaction extends Document {
  hash: string;
  from: string;
  gas: number;
  gasPrice: string;
  lowercaseFrom: string;
  lowercaseTo: string;
  time: string;
}

export const transactionSchema = new Schema<ITransaction>({
  hash: { type: String, required: true },
  from: { type: String, required: true },
  gas: { type: Number, required: true },
  gasPrice: { type: String, required: true },
  lowercaseFrom: { type: String, required: true },
  lowercaseTo: { type: String, required: true },
  time: { type: String, required: true },
});

/**
 * A transaction model. Mongoose will use this model to do CRUD operations.
 */

export const TransactionModel = mongoose.models.transaction
  ? mongoose.models.transaction
  : model<ITransaction>("transaction", transactionSchema);
