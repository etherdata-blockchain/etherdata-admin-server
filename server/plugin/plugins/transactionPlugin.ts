import { DatabasePlugin } from "../basePlugin";
import { ITransaction, TransactionModel } from "../../schema/transaction";
import { PluginName } from "../pluginName";
import { Model, Query } from "mongoose";

export class TransactionDBPlugin extends DatabasePlugin<ITransaction> {
  pluginName: PluginName = "transaction";
  protected model: Model<ITransaction> = TransactionModel;

  protected performList(): Query<ITransaction[], ITransaction[]> {
    //@ts-ignore
    return this.model.find({}).sort({ time: -1 });
  }
}
