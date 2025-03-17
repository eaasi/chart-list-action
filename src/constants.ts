// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

/** Prefix for section separators */
export const SECTION_SEPARATOR_PREFIX = '-----';

/** Heading for chart list */
export const CHART_SECTION_HEADING = 'Charts to be processed:';

/** RegExp for parsing chart entries */
export const CHART_ENTRY_REGEXP =
    /^\s*(?<name>[\w-]+) => \(version: "(?<version>.+)", path: "(?<path>.+)"\)/;

/** Message reported if no charts are found */
export const NO_CHARTS_FOUND_MESSAGE = 'No charts found!';

/** Desired behaviour if no charts are found */
export enum NotFoundBehaviour {
  IGNORE = 'ignore',
  ERROR = 'error',
  WARN = 'warn',
}

/** Action's input name */
export enum InputName {
  CT_LOG_FILE = 'ct-log-file',
  IF_NO_CHARTS_FOUND = 'if-no-charts-found',
}

/** Action's output name */
export enum OutputName {
  CHARTS = 'charts',
}
