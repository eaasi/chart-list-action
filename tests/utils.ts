// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { Chart } from "../src/main";

export function getRandomNumber(min: number, max: number): number {
  const delta = (max - min) * Math.random();
  return Math.floor(min + delta);
}

export function makeVersion(): string {
  const major = getRandomNumber(0, 11);
  const minor = getRandomNumber(0, 51);
  const patch = getRandomNumber(0, 125);
  return `${major}.${minor}.${patch}`;
}

export function makeChart(name: string, version: string): Chart {
  const chart: Chart = {
    name: name,
    version: version,
    path: `charts/${name}`,
  };

  return chart;
}

export function makeCharts(count: number): Chart[] {
  const charts: Chart[] = [];
  for (let i = 1; i <= count; ++i) {
    const name = `chart-${i}`;
    const version = makeVersion();
    charts.push(makeChart(name, version));
  }

  return charts;
}
