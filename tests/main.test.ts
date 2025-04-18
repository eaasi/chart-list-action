// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fs, vol } from 'memfs';
import * as core from '@actions/core';
import { InputName, NotFoundBehaviour, OutputName } from '../src/constants.js';
import { NO_CHARTS_FOUND_MESSAGE } from '../src/constants.js';
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

  const EMPTY_LOG = ChartTestingLog.create('empty.log', []);
  const NFB = [
    NotFoundBehaviour.IGNORE,
    NotFoundBehaviour.WARN,
  ];

  test.each(NFB)(`from '${EMPTY_LOG.name}' (if-no-charts-found = %s)`, async (nfb) => {
    const logfile = `${WORKDIR}/chart-testing.log`;

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CT_LOG_FILE:
          return logfile;
        case InputName.IF_NO_CHARTS_FOUND:
          return nfb;
        default:
          return '';
      }
    });

    // Prepare input data
    fs.writeFileSync(logfile, EMPTY_LOG.render());

    // Run action
    await main();

    // Check output parameters...

    const outputs = expect(core.setOutput);
    outputs.toHaveBeenCalledWith(OutputName.CHARTS, EMPTY_LOG.charts);

    const warnings = expect(core.warning);
    switch (nfb) {
      case NotFoundBehaviour.IGNORE:
        const infos = expect(core.info);
        infos.toHaveBeenLastCalledWith(NO_CHARTS_FOUND_MESSAGE);
        warnings.toHaveBeenCalledTimes(0);
        break;
      case NotFoundBehaviour.WARN:
        warnings.toHaveBeenCalledOnce();
        warnings.toHaveBeenLastCalledWith(NO_CHARTS_FOUND_MESSAGE);
        break;
    }
  });
});

describe('extract charts (-)', () => {
  const charts = utils.makeCharts(utils.getRandomNumber(3, 6));
  const LOGS: ChartTestingLog[] = [
    ChartTestingLog.create('incomplete.log', charts.slice(0, charts.length - 2)),
    ChartTestingLog.create('ill-formed-v1.log', charts, (c) => ` ${c.name}`),
    ChartTestingLog.create('ill-formed-v2.log', charts, (c) => ` ${c.name} => ()`),
    ChartTestingLog.create('ill-formed-v3.log', charts, (c) => ` ${c.name} => (version: ${c.version}, path: ${c.path})`),
    ChartTestingLog.create('ill-formed-v4.log', charts, (c) => ` ${c.name} => ("version":"${c.version}","path":"${c.path}")`),
    ChartTestingLog.create('ill-formed-v5.log', charts, (c) => ` ${c.name} => (version = "${c.version}", path = "${c.path}")`),
    ChartTestingLog.create('empty.log', []),
  ];

  test.fails.each(LOGS)('from $name', async (data) => {
    const logfile = `${WORKDIR}/chart-testing.log`;

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CT_LOG_FILE:
          return logfile;
        case InputName.IF_NO_CHARTS_FOUND:
          return NotFoundBehaviour.ERROR;
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
    outputs.toHaveBeenCalledWith(OutputName.CHARTS, charts);
  });
});
