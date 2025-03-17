// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { PathLike } from 'node:fs';
import fs from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import * as core from '@actions/core';
import * as constants from './constants.js';
import { InputName, OutputName } from './constants.js';

export const TEXT_ENCODING = 'utf8';

export interface Chart {
  name: string,
  version: string,
  path: string,
}

const enum ParserState {
  SEARCHING,
  PARSING,
  FINISHED,
}

async function extract(logfile: PathLike): Promise<Chart[]> {
  const charts: Chart[] = [];
  const fd = await fs.open(logfile, 'r');
  try {
    const reader = readline.createInterface({
      input: fd.createReadStream({ encoding: TEXT_ENCODING }),
    });

    try {
      let state = ParserState.SEARCHING;
      let prevline: string | undefined = undefined;
      let numChartsFailed = 0;

      core.info('Searching for chart entries:');
      for await (const line of reader) {
        if (state === ParserState.SEARCHING) {
          core.info('> ' + line);
          if (line.startsWith(constants.SECTION_SEPARATOR_PREFIX)) {
            prevline = prevline?.trimStart();
            if (prevline?.startsWith(constants.CHART_SECTION_HEADING)) {
              core.info('');
              core.info('Found chart entries!');
              core.info('');
              core.info('Parsing chart details:');
              state = ParserState.PARSING;
            }
          }

          prevline = line;
        }
        else if (state === ParserState.PARSING) {
          if (line.startsWith(constants.SECTION_SEPARATOR_PREFIX)) {
            core.info('-> Found end of chart list, stopping.');
            state = ParserState.FINISHED;
            break;
          }

          core.info('>> ' + line);

          const match = line.match(constants.CHART_ENTRY_REGEXP);
          if (match?.groups) {
            const chart: Chart = {
              name: match.groups.name,
              version: match.groups.version,
              path: match.groups.path,
            };

            core.info(`-> CHART "${chart.name}" = ` + JSON.stringify(chart));
            charts.push(chart);
          }
          else {
            core.info('-> FAILED!');
            ++numChartsFailed;
          }
        }
      }

      if (state === ParserState.PARSING) {
        core.info('-> End of file reached, stopping.');
        state = ParserState.FINISHED;
      }

      if (state === ParserState.FINISHED) {
        core.info('');
        core.info('Finished parsing chart details:');
        core.info(`-> ${charts.length} chart(s) parsed, ${numChartsFailed} failed`);
        if (numChartsFailed > 0) {
          throw new Error(`Parsing ${numChartsFailed} chart(s) failed!`);
        }
      }
    }
    finally {
      reader.close();
    }
  }
  finally {
    await fd.close();
  }

  return Promise.resolve(charts);
}

/** The main function for the action. */
export async function main(): Promise<void> {
  // Initialize input parameters...
  const logfile = core.getInput(InputName.CT_LOG_FILE, { required: true });

  core.info(`Processing file "${logfile}"...`);
  try {
    // Extract charts from log file...
    const charts = await extract(logfile);
    if (charts.length < 1) {
      throw new Error('No charts found!');
    }

    // Output computed results...
    core.setOutput(OutputName.CHARTS, charts);
  }
  catch (error) {
    core.error(`Processing file "${logfile}" failed!`);
    core.setFailed((error instanceof Error) ? error : 'Extracting chart details failed!');
    throw error;
  }
}
