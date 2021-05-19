import { TickerChangeStatistics } from './binanceSdk/interfaces';

export function calculateMean(numbers: number[]) {
  if (!numbers.length) {
    return 0;
  }
  const total = numbers.reduce((a, c) => a + c, 0);
  return total / numbers.length;
}

export function compareVolume(
  tickerStatsA: TickerChangeStatistics,
  tickerStatsB: TickerChangeStatistics
) {
  if (+tickerStatsA.volume < +tickerStatsB.volume) {
    return 1;
  }
  if (+tickerStatsA.volume > +tickerStatsB.volume) {
    return -1;
  }
  return 0;
}
