import WebSocket from 'ws';

import { BinanceApi } from './binanceSdk/binance-api';
import { BinanceWs } from './binanceSdk/binance-ws';
import { TradeEvent } from './binanceSdk/interfaces';
import { config } from './config';
import { calculateMean, compareVolume } from './utils';

const binanceApi = new BinanceApi(config.binance.testnet.baseApiUrl);
const binanceWs = new BinanceWs(config.binance.testnet.baseWsUrl, binanceApi);

export async function watchTradeWebsokets() {
  const result = await binanceApi.getTickerDailyChangeStatistics();

  const sortedVolume = result.sort(compareVolume);

  const hight10byVolume = sortedVolume.slice(0, 10);

  let minLatency: number = 0;
  let maxLatency: number = 0;
  let allLatencies: number[] = [];

  hight10byVolume.forEach((ticker) => {
    console.log(`${ticker.symbol}@trade`);
    binanceWs.createSocket(`${ticker.symbol}@trade`);
  });

  binanceWs.on('trade', (event: TradeEvent) => {
    const now = Date.now();
    const latency = now - event.E;

    console.log('event', event.s);
    console.log('latency', latency);
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
  }, 1000 * 5);
}
