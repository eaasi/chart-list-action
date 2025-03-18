// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fs, vol } from 'memfs';
import * as core from '@actions/core';
import { InputName, NotFoundBehaviour, OutputName } from '../src/constants.js';
import { main } from '../src/main.js';
import { ChartTestingLog } from './log.js';
import * as utils from './utils.js';

vi.mock('node:fs');
vi.mock('node:fs/promises');
vi.mock('readline');
vi.mock('@actions/core');

const WORKDIR = '/data';

beforeEach(() => {
  // Prepare in-memory fs
  vol.mkdirSync(WORKDIR);
});

afterEach(() => {
  vi.resetAllMocks();

  // Reset in-memory fs
  vol.reset();
});

describe('extract charts (+)', () => {
  const LOGS: ChartTestingLog[] = [
    ChartTestingLog.create('short.log', utils.makeCharts(utils.getRandomNumber(1, 6))),
    ChartTestingLog.create('long.log', utils.makeCharts(utils.getRandomNumber(10, 26))),
  ];

  test.each(LOGS)('from $name', async (data) => {
    const logfile = `${WORKDIR}/chart-testing.log`;

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CT_LOG_FILE:
          return logfile;
        default:
          return '';
      }
    });

    // Prepare input data
    fs.writeFileSync(logfile, data.render());

    // Run action
    await main();

    // Check output parameters
    const outputs = expect(core.setOutput);
    outputs.toHaveBeenCalledWith(OutputName.CHARTS, data.charts);
  });
});
