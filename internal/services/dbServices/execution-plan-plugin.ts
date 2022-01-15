import { DatabasePlugin } from "../../../server/plugin/basePlugin";
import { PluginName } from "../../../server/plugin/pluginName";
import { Model } from "mongoose";
import {
  ExecutionPlanModel,
  IExecutionPlan,
} from "../dbSchema/update-template/execution_plan";

/**
 * Execution plan plugin
 */
export class ExecutionPlanPlugin extends DatabasePlugin<IExecutionPlan> {
  pluginName: PluginName = "executionPlan";
  protected model: Model<IExecutionPlan> = ExecutionPlanModel;

  /**
   * Get execution plans by update template
   * @param id
   */
  async getPlans(id: string): Promise<IExecutionPlan[] | undefined> {
    const query = this.model
      .find({ updateTemplate: id })
      .sort({ timestamp: 1 });

    return query.exec();
  }

  /**
   * Delete Execution plans by update template id
   * @param id
   */
  async delete(id: any): Promise<any> {
    const query = this.model.deleteMany({ updateTemplate: id });
    await query.exec();
  }
}
