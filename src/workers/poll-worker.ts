import * as cosmwasm from "@cosmjs/cosmwasm-stargate";
import {
  RPC_PROVIDER_ENDPOINT,
  CONTRACT_ADDRESS,
  CRONJOB_DELAY,
  MAX_BLOCK_RANGE,
  DEFAULT_START_BLOCK,
} from "../loaders/constants";
import { Poll } from "../database/entities/poll.entity";
import { Block } from "../database/entities/block.entity";
import { request } from "undici";

export class PollWorker {
  private static async _updateStartBlock(toBlock: number) {
    let blockData = await Block.findOne({ where: { id: 1 } });
    if (blockData) {
      blockData.block = toBlock;
      await blockData.save();
    } else {
      await Block.insert({ id: 1, block: toBlock });
    }
  }

  private static async _getStartBlockNumber() {
    let blockData = await Block.findOne({ where: { id: 1 } });
    if (blockData) {
      return blockData.block;
    }
    return DEFAULT_START_BLOCK;
  }

  private static async _getLatestBlockNumber() {
    const response = await request(`http://3.143.254.222:26657/abci_info`);
    const responseJson = await response.body.json();
    return Number(responseJson["result"]["response"]["last_block_height"]);
  }

  private static async _getToBlock(fromBlock: number, latestBlock: number) {
    const theoryToBlock = fromBlock + MAX_BLOCK_RANGE;
    return Math.min(latestBlock, theoryToBlock);
  }

  private static async _scanBlock(blockNumber: number) {
    try {
      const response = await request(
        `http://3.143.254.222:26657/block_results?height=${blockNumber}`
      );
      const responseJson = await response.body.json();
      for (const tx of responseJson.result.txs_results) {
        try {
          const currentEvent = JSON.parse(tx.log)[0].events[1]["attributes"];

          if (currentEvent[1].value == "end_poll") {
            const newEndPoll = new Poll();
            newEndPoll.contract_address = currentEvent[0].value;
            if (newEndPoll.contract_address != CONTRACT_ADDRESS) continue;
            newEndPoll.id = Number(currentEvent[2].value);
            console.log(`Found an Ended Poll [${newEndPoll.id}]`);
            newEndPoll.rejected_reason = currentEvent[3].value || "";
            newEndPoll.passed = Boolean(currentEvent[4].value);
            newEndPoll.yes_votes = Number(currentEvent[5].value);
            newEndPoll.no_votes = Number(currentEvent[6].value);
            newEndPoll.tallied_weight = Number(currentEvent[7].value);
            newEndPoll.staked_weight = Number(currentEvent[8].value);
            newEndPoll.poll_quorum = Number(currentEvent[9].value);
            newEndPoll.quorum = Number(currentEvent[12].value);
            await Poll.save(newEndPoll);
          }
        } catch (err) {}
      }
    } catch (err) {}
  }

  private static async _crawlData(fromBlock: number, toBlock: number) {
    const blockNumbers: number[] = [];
    for (let i = fromBlock; i <= toBlock; i++) blockNumbers.push(i);
    while (blockNumbers.length) {
      await Promise.all(
        blockNumbers
          .splice(0, 200)
          .map(async (blockNumber) => await this._scanBlock(blockNumber))
      );
    }
  }

  public static async run(): Promise<any> {
    try {
      console.log("============ Start crawling ============");
      const currentLatestBlockNumber = await this._getLatestBlockNumber();
      console.log("latest block: " + currentLatestBlockNumber);

      const currentStartBlockNumber = await this._getStartBlockNumber();
      console.log("from block: " + currentStartBlockNumber);
      const currentToBlockNumber = await this._getToBlock(
        currentStartBlockNumber,
        currentLatestBlockNumber
      );
      console.log("to block: " + currentToBlockNumber);
      console.log("Scanning...");

      await this._crawlData(currentStartBlockNumber, currentToBlockNumber);

      await this._updateStartBlock(currentToBlockNumber);
    } catch (err) {
      console.log(`Something went wrong, ${err.message}`);
    }
    console.log(`Waiting for ${CRONJOB_DELAY} min(s)...`);
  }
}
