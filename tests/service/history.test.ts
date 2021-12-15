global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

import { ETDHistory } from "../../server/";
import moment from "moment";

const now = moment("2020-03-01", "YYYY-MM-DD");
const oneDay = moment("2020-03-02", "YYYY-MM-DD");
const twoDay = moment("2020-03-03", "YYYY-MM-DD");
const threeDay = moment("2020-03-04", "YYYY-MM-DD");

test("Test add block time", () => {
  const history = new ETDHistory(3);
  history.addBlockTime(
    { blockTime: 2000, time: now, blockNumber: 10, avgBlockTime: 100 },
    1
  );
  expect(history.blockTimeHistory.length).toBe(1);

  history.addBlockTime(
    { blockTime: 2000, time: now, blockNumber: 10, avgBlockTime: 100 },
    1
  );
  expect(history.blockTimeHistory.length).toBe(1);
  expect(history.lastBlockAt).toBe(now);

  history.addBlockTime(
    { blockTime: 3000, time: oneDay, blockNumber: 20, avgBlockTime: 100 },
    1
  );
  expect(history.blockTimeHistory.length).toBe(2);
  expect(history.lastBlockAt).toBe(oneDay);

  history.addBlockTime(
    { blockTime: 4000, time: twoDay, blockNumber: 30, avgBlockTime: 100 },
    1
  );
  expect(history.blockTimeHistory.length).toBe(3);
  expect(history.lastBlockAt).toBe(twoDay);

  history.addBlockTime(
    { blockTime: 5000, time: threeDay, blockNumber: 40, avgBlockTime: 100 },
    1
  );
  expect(history.blockTimeHistory.length).toBe(3);
  expect(history.lastBlockAt).toBe(threeDay);

  expect(history.blockTimeHistory[0].blockTime).toBe(3000);
  expect(history.blockTimeHistory[1].blockTime).toBe(4000);
  expect(history.blockTimeHistory[2].blockTime).toBe(5000);
});

it("Test add difficulty", () => {
  let history = new ETDHistory(3);

  history.addDifficultHistory({ difficulty: 2000, time: now }, 1);
  expect(history.difficultyHistory.length).toBe(1);

  history.addDifficultHistory({ difficulty: 2000, time: now }, 1);
  expect(history.difficultyHistory.length).toBe(1);

  history.addDifficultHistory({ difficulty: 3000, time: oneDay }, 1);
  expect(history.difficultyHistory.length).toBe(2);

  history.addDifficultHistory({ difficulty: 4000, time: twoDay }, 1);
  expect(history.difficultyHistory.length).toBe(3);

  history.addDifficultHistory({ difficulty: 5000, time: threeDay }, 1);
  expect(history.difficultyHistory.length).toBe(3);

  expect(history.difficultyHistory[0].difficulty).toBe(3000);
  expect(history.difficultyHistory[1].difficulty).toBe(4000);
  expect(history.difficultyHistory[2].difficulty).toBe(5000);
});

test("Add block time if peers count is 0", () => {
  let history = new ETDHistory(3);
  history.addBlockTime(
    { blockTime: 10, blockNumber: 10, avgBlockTime: 10, time: now },
    0
  );

  expect(history.blockTimeHistory.length).toBe(0);
});

test("Add difficulty history if peers count is 0", () => {
  let history = new ETDHistory(3);
  history.addDifficultHistory({ difficulty: 5000, time: threeDay }, 0);

  expect(history.difficultyHistory.length).toBe(0);
});
