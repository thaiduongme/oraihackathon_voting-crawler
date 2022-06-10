import { CronJob } from "cron";
import { PollWorker } from "../workers/poll-worker";
import { CRONJOB_DELAY } from "../loaders/constants";

export const crawlingCronJob = new CronJob({
  cronTime: `*/${CRONJOB_DELAY} * * * *`,
  onTick: async function () {
    await PollWorker.run();
  },
  start: true,
  timeZone: "Asia/Ho_Chi_Minh",
});
