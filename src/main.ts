import * as dotenv from "dotenv";
import { connectDB } from "./database/connection";
import { crawlingCronJob } from "./schedule/cron-job";
import { PollWorker } from "./workers/poll-worker";

// Setup environment variables
dotenv.config({ path: ".env.development" });

(async () => {
  await connectDB();
  await PollWorker.run();
  await crawlingCronJob.start();
})();
