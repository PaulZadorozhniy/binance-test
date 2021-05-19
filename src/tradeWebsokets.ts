import { BinanceApi } from './binanceSdk/binance-api';
import { BinanceWs } from './binanceSdk/binance-ws';
import { TradeEvent } from './binanceSdk/interfaces';
import { config } from './config';
import { calculateMean, compareVolume } from './utils';

export async function watchTradeWebsokets() {
  const binanceApi = new BinanceApi(config.binance.mainnet.baseApiUrl);
  const binanceWs = new BinanceWs(config.binance.mainnet.baseWsUrl, binanceApi);

  const result = await binanceApi.getTickerDailyChangeStatistics();

  const sortedVolume = result.sort(compareVolume);

  const hight10byVolume = sortedVolume.slice(0, 10);

  let minLatency: number = 0;
  let maxLatency: number = 0;
  let allLatencies: number[] = [];

  hight10byVolume.forEach((ticker) => {
    binanceWs.createSocket(`${ticker.symbol}@trade`);
  });

  binanceWs.on('trade', (event: TradeEvent) => {
    const now = Date.now();
    const latency = now - event.E;

    allLatencies.push(latency);

    if (!minLatency || minLatency > latency) {
      minLatency = latency;
    }
    if (maxLatency < latency) {
      maxLatency = latency;
    }
  });

  setInterval(() => {
    console.log({
      minLatency,
      maxLatency,
      meanLatency: calculateMean(allLatencies),
    });
  }, 1000 * 60);
}
