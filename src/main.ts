import * as dotenv from "dotenv";
import { connectDB } from "./database/connection";
import { crawlingCronJob } from "./schedule/cron-job";

// Setup environment variables
dotenv.config({ path: ".env.development" });

(async () => {
  await connectDB();
  await crawlingCronJob.start();
})();
