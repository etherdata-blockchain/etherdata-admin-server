import { DatabasePlugin } from "../basePlugin";
import { IJobResult } from "../../schema/job-result";
import moment from "moment";
import { Channel } from "amqplib";

export class JobResultPlugin {
  private getQueueID(from: string) {
    return `result-${from}`;
  }

  async addResult(result: IJobResult) {
    //@ts-ignore
    const channel: Channel = global.QUEUE_CHANNEL;
    await channel.assertQueue(this.getQueueID(result.from), {
      autoDelete: true,
    });
    await channel.sendToQueue(
      this.getQueueID(result.from),
      Buffer.from(JSON.stringify(result))
    );
  }

  /**
   * Get results
   * @param from User ID
   */
  async getResults(from: string): Promise<IJobResult[] | undefined> {
    return new Promise(async (resolve, reject) => {
      //@ts-ignore
      const channel: Channel = global.QUEUE_CHANNEL;
      const result = await channel.assertQueue(this.getQueueID(from), {
        autoDelete: true,
      });

      if (result.messageCount === 0) {
        resolve(undefined);
      }

      await channel.consume(
        this.getQueueID(from),
        (message) => {
          if (message !== null) {
            const content = message.content.toString();
            channel.ack(message);
            resolve(JSON.parse(content));
          }
        },
        {}
      );
    });
  }

  /**
   * Remove outdated jobs
   * @param maximumDuration In seconds
   */
  async removeOutdatedJobs(maximumDuration: number) {}
}
