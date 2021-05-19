import axios from 'axios';
import { createHmac } from 'crypto';
import { config } from '../config';
import { Account, TickerChangeStatistics } from './interfaces';

export class BinanceApi {
  private apiKey: string = config.binance.testnet.apiKey;
  private secretKey: string = config.binance.testnet.secretKey;
  private baseApiUrl: string;
  private headers = {
    'X-MBX-APIKEY': this.apiKey,
  };

  constructor(apiUrl: string) {
    this.baseApiUrl = apiUrl;
  }

  public async getAccount(): Promise<Account> {
    const timestamp: number = new Date().getTime();
    const queryString: string = `timestamp=${timestamp}`;

    const hash: string = this.signature(queryString);

    console.log('signature', hash);
    console.log('timestamp', timestamp);

    const account = await axios.get<Account>(
      `${this.baseApiUrl}/api/v3/account`,
      {
        headers: this.headers,
        params: { timestamp, signature: hash },
      }
    );

    return account.data;
  }

  public async getUserDataListeningkey(): Promise<string> {
    const { data } = await axios.post(
      `${this.baseApiUrl}/api/v3/userDataStream`,
      null,
      {
        headers: this.headers,
      }
    );

    return data.listenKey;
  }

  public async keepAliveListeningKey(listenKey: string): Promise<void> {
    await axios.put(`${this.baseApiUrl}/api/v3/userDataStream`, null, {
      headers: this.headers,
      params: {
        listenKey,
      },
    });
  }

  public async getTickerDailyChangeStatistics(): Promise<
    TickerChangeStatistics[]
  > {
    const account = await axios.get<TickerChangeStatistics[]>(
      `${this.baseApiUrl}/api/v3/ticker/24hr`
    );

    return account.data;
  }

  private signature(queryString: string): string {
    return createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }
}
