import { Channel } from "amqplib";
import { IPendingJob } from "../../schema/pending-job";

export class PendingJobPlugin {
  private getQueueID(deviceID: string) {
    return `job-${deviceID}`;
  }

  /**
   * Get a job
   * @param deviceID
   */
  async getJob(deviceID: string): Promise<IPendingJob | undefined> {
    return new Promise(async (resolve, reject) => {
      //@ts-ignore
      const channel: Channel = global.QUEUE_CHANNEL;
      const result = await channel.assertQueue(this.getQueueID(deviceID), {
        autoDelete: true,
      });

      if (result.messageCount === 0) {
        resolve(undefined);
      }

      await channel.consume(
        this.getQueueID(deviceID),
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
   * Add a job
   * @param deviceID
   * @param job
   */
  async addJob(deviceID: string, job: IPendingJob) {
    //@ts-ignore
    const channel: Channel = global.QUEUE_CHANNEL;
    await channel.assertQueue(this.getQueueID(deviceID), { autoDelete: true });
    await channel.sendToQueue(
      this.getQueueID(deviceID),
      Buffer.from(JSON.stringify(job))
    );
  }

  /**
   * Remove outdated jobs
   * @param maximumDuration In seconds
   */
  async removeOutdatedJobs(maximumDuration: number) {}
}
