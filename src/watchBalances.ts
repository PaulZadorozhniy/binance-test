import { BinanceApi } from './binanceSdk/binance-api';
import { BinanceWs } from './binanceSdk/binance-ws';
import {
  Account,
  AccountBalance,
  BalanceChange,
  OutboundAccountPositionEvent,
} from './binanceSdk/interfaces';
import { config } from './config';

const binanceApi = new BinanceApi(config.binance.testnet.baseApiUrl);
const binanceWs = new BinanceWs(config.binance.testnet.baseWsUrl, binanceApi);

export async function watchNonZeroAccountBalances() {
  const account: Account = await binanceApi.getAccount();

  const nonZeroAccountBalances = new Map<string, AccountBalance>();

  account.balances
    .filter((balance: AccountBalance) => +balance.free > 0)
    .forEach((balance) => nonZeroAccountBalances.set(balance.asset, balance));

  console.log('nonZeroAccountBalances', nonZeroAccountBalances);

  const listeningkey = await binanceApi.getUserDataListeningkey();

  await binanceWs.createSocket(listeningkey);

  binanceWs.on(
    'outboundAccountPosition',
    (message: OutboundAccountPositionEvent) => {
      message.B.forEach((changedBalance: BalanceChange) => {
        if (+changedBalance.f > 0) {
          return nonZeroAccountBalances.set(changedBalance.a, {
            asset: changedBalance.a,
            free: changedBalance.f,
            locked: changedBalance.l,
          } as AccountBalance);
        }

        nonZeroAccountBalances.delete(changedBalance.a);
      });

      console.log('nonZeroAccountBalances', nonZeroAccountBalances);
    }
  );
}
