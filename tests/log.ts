// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { Chart } from "../src/main";

const SEPARATOR_CHAR = '-';

const LOG_HEADER = `
Linting charts...
Version increment checking disabled.
`;

export type ChartFormatter = (chart: Chart) => string;

export const DefaultChartFormatter: ChartFormatter = (chart) => {
  return ` ${chart.name} => (version: "${chart.version}", path: "${chart.path}")`;
}

export class ChartTestingLog {
  name: string;
  charts: Chart[];
  header: string;
  separator: string = SEPARATOR_CHAR.repeat(60);
  formatter: ChartFormatter = DefaultChartFormatter;

  render(): string {
    let lines: string[] = [];
    if (this.header) {
      lines.push(this.header);
    }

    const trailers: string[] = [];

    lines.push(this.separator);
    lines.push(' Charts to be processed:');
    lines.push(this.separator);
    for (const chart of this.charts) {
      let chartstr = this.formatter(chart);
      lines.push(chartstr);

      // Prepare trailing messages...
      chartstr = chartstr.trimStart();
      trailers.push(`Linting chart "${chartstr.replaceAll('"', '\\"')}"`);
      trailers.push(`Validating /data/${chart.path}/Chart.yaml...`);
      trailers.push('Validation success!');
      trailers.push(`==> Linting ${chart.path}`);
      if (Math.random() >= 0.5) {
        trailers.push('[INFO] Chart.yaml: icon is recommended');
      }
      trailers.push('');
      trailers.push(`1 chart(s) linted, 0 chart(s) failed`);
    }

    lines.push(this.separator);
    lines.push('');

    if (trailers.length > 0) {
      lines = lines.concat(trailers);
    }

    return lines.join('\n');
  }

  static create(name: string, charts: Chart[], formatter?: ChartFormatter): ChartTestingLog {
    const log = new ChartTestingLog();
    log.name = name;
    log.charts = charts;
    log.header = LOG_HEADER;
    if (formatter) {
      log.formatter = formatter;
    }

    return log;
  }
}
