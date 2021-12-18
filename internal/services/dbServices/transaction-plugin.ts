<<<<<<< HEAD:services/dbServices/transactionPlugin.ts
<<<<<<< HEAD
import { DatabasePlugin } from "../../server/plugin/basePlugin";
import { ITransaction, TransactionModel } from "../dbSchema/transaction";
import { PluginName } from "../../server/plugin/pluginName";
import { Model, Query } from "mongoose";
=======
=======
>>>>>>> upstream/dev
import {DatabasePlugin} from "../../../server/plugin/basePlugin";
import {ITransaction, TransactionModel} from "../dbSchema/transaction";
import {PluginName} from "../../../server/plugin/pluginName";
import {Model, Query} from "mongoose";
<<<<<<< HEAD
>>>>>>> upstream/install-script:internal/services/dbServices/transaction-plugin.ts
=======
=======
import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { ITransaction, TransactionModel } from "../dbSchema/transaction";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model, Query } from "mongoose";
>>>>>>> upstream/dev:internal/services/dbServices/transaction-plugin.ts
>>>>>>> upstream/dev

/**
 * Transaction db plugin
 */
export class TransactionDBPlugin extends DatabasePlugin<ITransaction> {
  pluginName: PluginName = "transaction";
  protected model: Model<ITransaction> = TransactionModel;

  // eslint-disable-next-line require-jsdoc
  protected performList(): Query<ITransaction[], ITransaction[]> {
    //@ts-ignore
    return this.model.find({}).sort({ time: -1 });
  }
}
