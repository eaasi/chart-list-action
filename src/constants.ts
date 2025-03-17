// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

/** Prefix for section separators */
export const SECTION_SEPARATOR_PREFIX = '-----';

/** Heading for chart list */
export const CHART_SECTION_HEADING = 'Charts to be processed:';

/** RegExp for parsing chart entries */
export const CHART_ENTRY_REGEXP =
    /^\s*(?<name>[\w-]+) => \(version: "(?<version>.+)", path: "(?<path>.+)"\)/;

/** Action's input name */
export enum InputName {
  CT_LOG_FILE = 'ct-log-file',
}

/** Action's output name */
export enum OutputName {
  CHARTS = 'charts',
}
