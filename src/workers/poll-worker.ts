import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import {
  RPC_PROVIDER_ENDPOINT,
  CONTRACT_ADDRESS,
  CRONJOB_DELAY,
} from "../loaders/constants";
import { Poll } from "../database/entities/poll.entity";

export class PollWorker {
  private static async _getTotalPoll(): Promise<number> {
    const client = await cosmwasm.SigningCosmWasmClient.connect(
      RPC_PROVIDER_ENDPOINT
    );
    const payload = { config: {} };
    const result = await client.queryContractSmart(CONTRACT_ADDRESS, payload);
    return result["poll_count"];
  }

  private static async _getCrawledIds(): Promise<number[]> {
    const result = await Poll.createQueryBuilder("poll")
      .select(["poll.id"])
      .getMany();
    const ids: number[] = [];
    for (const r of result) {
      ids.push(r.id);
    }
    return ids;
  }

  private static async _getPollById(id: number): Promise<any> {
    const client = await cosmwasm.SigningCosmWasmClient.connect(
      RPC_PROVIDER_ENDPOINT
    );
    const payload = { poll: { poll_id: id } };

    const currentPoll = await client.queryContractSmart(
      CONTRACT_ADDRESS,
      payload
    );
    return {
      id,
      creator: currentPoll.creator,
      status: currentPoll.status,
      quorumPercentage: currentPoll.quorum_percentage,
      startHeight: currentPoll.start_height,
      endHeight: currentPoll.end_height,
      description: currentPoll.description,
    };
  }

  public static async run(): Promise<any> {
    try {
      console.log("============ Start crawling ============");
      const currentTotalPoll = await this._getTotalPoll();
      const crawledIds = await this._getCrawledIds();
      console.log(`Total poll: ${currentTotalPoll}`);
      for (let i = 1; i <= currentTotalPoll; i++) {
        let currentStatus: string = "";
        if (crawledIds.includes(i)) {
          currentStatus = "already crawled";
        } else {
          const currentPoll = await this._getPollById(i);
          if (currentPoll.status == "InProgress") {
            currentStatus = "still in progress";
          } else {
            await Poll.insert(currentPoll);
            currentStatus = "saved to database successfully!";
          }
        }
        console.log(`[Poll ID ${i}]: ${currentStatus}`);
      }
    } catch (err) {
      console.log(`Something went wrong, ${err.message}`);
    }
    console.log(`Waiting for ${CRONJOB_DELAY} min(s)...`);
  }
}
